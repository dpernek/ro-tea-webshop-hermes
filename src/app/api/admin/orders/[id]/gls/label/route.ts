import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { isGlsConfigured } from "@/lib/shipping/gls/config";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders/[id]/gls/label
 * Return the stored GLS label PDF (base64) for download.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await requireAdmin();
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
      orderNumber: true,
      glsShipmentId: true,
      glsParcelNumber: true,
      glsLabelData: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  if (!order.glsLabelData) {
    return NextResponse.json(
      { error: "Naljepnica nije dostupna. Prvo kreirajte GLS pošiljku." },
      { status: 400 },
    );
  }

  // The label is stored as base64 PDF data
  const pdfBuffer = Buffer.from(order.glsLabelData, "base64");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="GLS-${order.orderNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
