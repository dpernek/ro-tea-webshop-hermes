import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BOOLEAN_HEADERS = [
  "Broj narudžbe",
  "Kupac",
  "Email",
  "Telefon",
  "Adresa",
  "Međuzbroj (€)","Ukupno (€)",
  "Status narudžbe",
  "Status plaćanja",
  "Način plaćanja",
  "Dostava",
  "Stripe sesija",
  "Datum kreiranja",
  "Plaćeno",
];

const statusLabels: Record<string, string> = {
  PENDING: "Na čekanju",
  CONFIRMED: "Potvrđeno",
  PROCESSING: "U obradi",
  SHIPPED: "Poslano",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  REFUNDED: "Refundirano",
};

const paymentLabels: Record<string, string> = {
  UNPAID: "Nije plaćeno",
  PENDING: "Plaćanje u tijeku",
  PAID: "Plaćeno",
  FAILED: "Neuspjelo",
  CANCELLED: "Otkazano",
  EXPIRED: "Isteklo",
  REFUNDED: "Refundirano",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Kartica (Stripe)",
  cod: "Pouzeće",
  bank_transfer: "Bankovna transakcija",
};

function escapeCsvField(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function POST(req: NextRequest) {
  const access = await requireAdmin();
  if (access) return access;

  const body = await req.json().catch(() => ({}));
  const { status, paymentStatus, dateFrom, dateTo } = body;

  const where: any = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingAddress: true,
      subtotal: true, shippingTotal: true, total: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      shippingMethod: true,
      stripeCheckoutSessionId: true,
      createdAt: true,
      paidAt: true,
    },
  });

  const header = BOOLEAN_HEADERS.map(escapeCsvField).join(",");
  const rows = orders.map((o) =>
    [
      o.subtotal != null ? o.subtotal.toFixed(2) : "0.00",
      escapeCsvField(o.customerName),
      escapeCsvField(o.customerEmail),
      escapeCsvField(o.customerPhone),
      escapeCsvField(o.shippingAddress || ""),
      escapeCsvField(o.total.toFixed(2)),
      escapeCsvField(statusLabels[o.status] || o.status),
      escapeCsvField(paymentLabels[o.paymentStatus] || o.paymentStatus),
      escapeCsvField(paymentMethodLabels[o.paymentMethod] || o.paymentMethod),
      escapeCsvField(o.shippingMethod || ""),
      escapeCsvField(o.stripeCheckoutSessionId || ""),
      escapeCsvField(new Date(o.createdAt).toLocaleDateString("hr-HR")),
      escapeCsvField(o.paidAt ? new Date(o.paidAt).toLocaleDateString("hr-HR") : ""),
    ].join(",")
  );

  const bom = "\uFEFF"; // BOM for Excel to recognize UTF-8
  const csv = bom + [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="narudzbe-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
