import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { isGlsConfigured } from "@/lib/shipping/gls/config";
import { cancelLabels } from "@/lib/shipping/gls/restClient";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/gls/cancel
 * Cancel/delete GLS shipment labels for this order.
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
      { error: "GLS nije konfiguriran." },
      { status: 400 },
    );
  }

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true, orderNumber: true,
      glsShipmentId: true,
      glsParcelNumber: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  if (!order.glsShipmentId) {
    return NextResponse.json(
      { error: "Ova narudžba nema GLS pošiljku. Nema što za stornirati." },
      { status: 400 },
    );
  }

  try {
    const results = await cancelLabels([order.glsShipmentId]);

    // GLS successful if no error thrown — clear local GLS data regardless of response shape
    await db.order.update({
      where: { id },
      data: {
        glsShipmentId: null,
        glsParcelNumber: null,
        glsLabelData: null,
        glsStatusData: JSON.stringify({ status: "CANCELLED", cancelledAt: new Date().toISOString() }),
        glsCreatedAt: null,
      },
    });

    await logAction("orders", "gls_cancel", `GLS pošiljka stornirana za ${order.orderNumber}`, order.id);

    return NextResponse.json({
      success: true,
      message: "GLS naljepnica je uspješno stornirana.",
    });
  } catch (error: any) {
    console.error("[GLS CANCEL]", error);
    // If GLS parcel already deleted/stale, still clear local data
    const isAlreadyGone = error?.message?.includes("not exist") || error?.message?.includes("not found") || error?.message?.includes("doesn't exist");
    if (isAlreadyGone) {
      await db.order.update({
        where: { id },
        data: {
          glsShipmentId: null, glsParcelNumber: null,
          glsLabelData: null,
          glsStatusData: JSON.stringify({ status: "CLEANED_UP", cleanedAt: new Date().toISOString() }),
          glsCreatedAt: null,
        },
      });
      return NextResponse.json({ success: true, message: "GLS pošiljka je već bila uklonjena. Lokalno stanje očišćeno." });
    }
    const message = error.code
      ? `GLS greška (${error.code}): ${error.message}`
      : error.message || "Nepoznata greška pri storniranju GLS naljepnice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
