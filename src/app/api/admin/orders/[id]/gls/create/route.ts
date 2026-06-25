import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isGlsConfigured } from "@/lib/shipping/gls/client";
import { getGlsConfig } from "@/lib/shipping/gls/config";
import { prepareLabelsWithLabels } from "@/lib/shipping/gls/prepareLabels";
import type { GlsParcelInfo } from "@/lib/shipping/gls/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/gls/create
 * Create a GLS shipment (prepare labels) for this order.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Neovlašten pristup." }, { status: 401 });
  }

  const { id } = await params;

  if (!isGlsConfigured()) {
    return NextResponse.json(
      { error: "GLS nije konfiguriran. Postavite GLS_USERNAME, GLS_PASSWORD i GLS_CLIENT_NUMBER u .env datoteci." },
      { status: 400 },
    );
  }

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      shippingAddress: true,
      shippingMethod: true,
      total: true,
      glsShipmentId: true,
      glsParcelNumber: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  if (!order.shippingAddress) {
    return NextResponse.json(
      { error: "Narudžba nema adresu za dostavu. Nije moguće kreirati GLS pošiljku." },
      { status: 400 },
    );
  }

  if (order.glsShipmentId) {
    return NextResponse.json(
      { error: "GLS pošiljka je već kreirana za ovu narudžbu." },
      { status: 409 },
    );
  }

  // Parse shipping address: "Street 123, 10000 City"
  const addrParts = order.shippingAddress.split(",").map(s => s.trim());
  let street = addrParts[0] || "";
  const cityPostal = addrParts[1] || "";
  let houseNumber = "";
  let city = "";
  let zipCode = "";

  // Try to extract house number from street
  const hnMatch = street.match(/^(.+?)\s+(\d+[a-zA-Z]?)$/);
  if (hnMatch) {
    street = hnMatch[1];
    houseNumber = hnMatch[2];
  }

  const cpMatch = cityPostal.match(/^(\d{5})\s+(.+)$/);
  if (cpMatch) {
    zipCode = cpMatch[1];
    city = cpMatch[2];
  } else {
    city = cityPostal;
  }

  const config = getGlsConfig();
  const isCod = order.shippingMethod?.toLowerCase().includes("pouzeće") || false;

  const parcelInfo: GlsParcelInfo = {
    ClientReference: order.orderNumber,
    CODAmount: isCod ? order.total : undefined,
    CODReference: isCod ? order.orderNumber : undefined,
    Content: `RO-TEA narudžba ${order.orderNumber}`,
    Count: 1,
    DeliveryAddress: {
      Name: order.customerName,
      Street: street,
      HouseNumber: houseNumber || undefined,
      City: city,
      ZipCode: zipCode,
      CountryCode: config.countryCode,
      ContactName: order.customerName,
      ContactPhone: order.customerPhone,
      ContactEmail: order.customerEmail,
    },
    Service: {
      Code: "PSD",
      ...(isCod ? { Parameter: [{ Code: "COD", Value: order.total?.toFixed(2) || "0" }] } : {}),
    },
    Weight: 1,
  };

  try {
    const result = await prepareLabelsWithLabels([parcelInfo]);
    const parcel = result.parcels[0];

    if (!parcel) {
      return NextResponse.json(
        { error: "GLS nije vratio podatke o pošiljci." },
        { status: 500 },
      );
    }

    await db.order.update({
      where: { id },
      data: {
        glsShipmentId: parcel.parcelId,
        glsParcelNumber: parcel.parcelNumber,
        glsLabelData: result.labelsBase64 || null,
        glsStatusData: JSON.stringify({ status: "CREATED", createdAt: new Date().toISOString() }),
        glsCreatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      parcelId: parcel.parcelId,
      parcelNumber: parcel.parcelNumber,
      hasLabel: !!result.labelsBase64,
    });
  } catch (error: any) {
    console.error("[GLS CREATE]", error);
    const message = error.code
      ? `GLS greška (${error.code}): ${error.message}`
      : error.message || "Nepoznata greška pri kreiranju GLS pošiljke.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
