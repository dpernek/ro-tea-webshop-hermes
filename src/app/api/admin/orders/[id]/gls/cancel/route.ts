import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
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
      id: true,
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
    const result = results[0];

    if (!result) {
      return NextResponse.json(
        { error: "GLS nije vratio rezultat storniranja." },
        { status: 500 },
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: `GLS nije uspio stornirati naljepnicu: ${"Failed"}`,
        },
        { status: 500 },
      );
    }

    // Clear GLS data from order
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

    return NextResponse.json({
      success: true,
      message: "GLS naljepnica je uspješno stornirana.",
    });
  } catch (error: any) {
    console.error("[GLS CANCEL]", error);
    const message = error.code
      ? `GLS greška (${error.code}): ${error.message}`
      : error.message || "Nepoznata greška pri storniranju GLS naljepnice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
