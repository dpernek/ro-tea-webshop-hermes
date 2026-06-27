import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { isGlsConfigured, getGlsConfig } from "@/lib/shipping/gls/config";

import { prepareLabels } from "@/lib/shipping/gls/restClient";


export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/gls/create
 * Create a GLS shipment (prepare labels) for this order.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requirePermission("orders", "write");
  if (access) {
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
      glsPickupPointId: true,
      glsPickupPointName: true,
      glsPickupPointAddress: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  const isPaketomat = order.shippingMethod === "GLS Paketomat";
  const isGls = order.shippingMethod === "GLS dostava" || isPaketomat;

  if (!order.shippingAddress && !isPaketomat) {
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

  let deliveryAddress: any;

  if (isPaketomat) {
    if (!order.glsPickupPointAddress) {
      return NextResponse.json(
        { error: "GLS Paketomat narudžba nema spremljene podatke paketomata." },
        { status: 400 },
      );
    }
    // GLS Paketomat: use paketomat address as delivery address
    // Format: "Street HouseNumber, ZipCode City" (e.g. "Letovanićka ulica 21 a, 10000 Zagreb")
    const parts = order.glsPickupPointAddress.split(",").map(s => s.trim());
    const streetPartRaw = parts[0] || "";
    const cityZip = parts.length > 1 ? parts[parts.length - 1] : "";
    let street = streetPartRaw;
    let houseNumber = "";
    let houseNumberInfo = "";
    // Parse: "Letovanićka ulica 21 a" → street="Letovanićka ulica", hn="21", hnInfo="a"
    const hnMatch = streetPartRaw.match(/^(.+?)\s+(\d+)(\s*[a-zA-Z]*)$/);
    if (hnMatch) {
      street = hnMatch[1];
      houseNumber = hnMatch[2];
      houseNumberInfo = (hnMatch[3] || "").trim();
    }
    const zipMatch = cityZip.match(/^(\d{5})\s+(.+)/);
    const addr: any = {
      Name: order.glsPickupPointName || order.customerName,
      Street: street,
      HouseNumber: houseNumber || undefined,
      City: zipMatch ? zipMatch[2] : cityZip,
      ZipCode: zipMatch ? zipMatch[1] : "",
      CountryIsoCode: "HR",
      ContactName: order.customerName,
      ContactPhone: order.customerPhone,
      ContactEmail: order.customerEmail,
    };
    if (houseNumberInfo) addr.HouseNumberInfo = houseNumberInfo;
    deliveryAddress = addr;
  } else {
    // Standard GLS dostava: parse shipping address
    const addrParts = (order.shippingAddress || "").split(",").map(s => s.trim());
    let street = addrParts[0] || "";
    const cityPostal = addrParts[1] || "";
    let houseNumber = "";
    let city = "";
    let zipCode = "";

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

    deliveryAddress = {
      Name: order.customerName,
      Street: street,
      HouseNumber: houseNumber || undefined,
      City: city,
      ZipCode: zipCode,
      CountryIsoCode: "HR",
      ContactName: order.customerName,
      ContactPhone: order.customerPhone,
      ContactEmail: order.customerEmail,
    };
  }

  const isCod = order.shippingMethod?.toLowerCase().includes("pouzeće") || false;

  const config = getGlsConfig();

  const parcelInfo: Record<string, unknown> = {
    ClientNumber: config.clientNumber,
    ClientReference: order.orderNumber,
    CODAmount: isCod ? order.total : undefined,
    CODReference: isCod ? order.orderNumber : undefined,
    Content: `RO-TEA narudžba ${order.orderNumber}`,
    Count: 1,
    DeliveryAddress: deliveryAddress,
    PickupAddress: {
      Name: "RO-TEA d.o.o.",
      Street: "Badalićeva",
      HouseNumber: "26b",
      City: "Zagreb",
      ZipCode: "10000",
      CountryIsoCode: "HR",
    },
    Service: isCod ? { Code: "PSD", Parameter: [{ Code: "COD", Value: order.total?.toFixed(2) || "0" }] } : { Code: "PSD" },
    Weight: 1,
  };

  // If Paketomat, add PSDParameter + FinalDeliveryAddress
  if (isPaketomat && order.glsPickupPointId) {
    (parcelInfo as any).PSDParameter = { StringValue: order.glsPickupPointId };
  }

  try {
    const result = await prepareLabels([parcelInfo]);
    const parcel = result[0];

    if (!parcel) {
      return NextResponse.json(
        { error: "GLS nije vratio podatke o pošiljci. Provjerite GLS vjerodajnice u .env datoteci." },
        { status: 500 },
      );
    }

    await db.order.update({
      where: { id },
      data: {
        glsShipmentId: parcel.parcelId,
        glsParcelNumber: parcel.parcelNumber,
        glsLabelData: null,
        glsStatusData: JSON.stringify({ status: "CREATED", createdAt: new Date().toISOString() }),
        glsCreatedAt: new Date(),
      },
    });

    await logAction("orders", "gls_create", `GLS pošiljka kreirana: ${parcel.parcelNumber} za ${order.orderNumber}`, order.id);

    return NextResponse.json({
      success: true,
      parcelId: parcel.parcelId,
      parcelNumber: parcel.parcelNumber,
      hasLabel: false,
    });
  } catch (error: any) {
    console.error("[GLS CREATE]", error);
    const message = error.code
      ? `GLS greška (${error.code}): ${error.message}`
      : error.message || "Nepoznata greška pri kreiranju GLS pošiljke.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
