import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { isGlsConfigured } from "@/lib/shipping/gls/config";
import { getParcelStatuses } from "@/lib/shipping/gls/restClient";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/gls/status
 * Refresh GLS parcel status from GLS API and return current status.
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

  if (!order.glsParcelNumber) {
    return NextResponse.json(
      { error: "Ova narudžba nema GLS pošiljku. Prvo kreirajte pošiljku." },
      { status: 400 },
    );
  }

  try {
    const results = await getParcelStatuses([order.glsParcelNumber]);
    const statusData = results[0];

    if (!statusData) {
      return NextResponse.json(
        { error: "GLS nije vratio podatke o statusu." },
        { status: 500 },
      );
    }

    // Store updated status
    const statusJson = JSON.stringify({
      updatedAt: new Date().toISOString(),
      statusInfo: statusData,
    });

    await db.order.update({
      where: { id },
      data: { glsStatusData: statusJson },
    });

    await logAction("orders", "gls_status", `GLS status osvježen za ${order.orderNumber}`, order.id);

    return NextResponse.json({
      success: true,
      parcelNumber: order.glsParcelNumber,
      statuses: statusData,
    });
  } catch (error: any) {
    console.error("[GLS STATUS]", error);
    const message = error.code
      ? `GLS greška (${error.code}): ${error.message}`
      : error.message || "Nepoznata greška pri dohvatu GLS statusa.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
