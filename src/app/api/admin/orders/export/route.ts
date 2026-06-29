import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Broj narudžbe",
  "Ime kupca",
  "Email",
  "Telefon",
  "Adresa",
  "Međuzbroj (€)",
  "Dostava (€)",
  "Popust (€)",
  "Kupon kod",
  "Ukupno (€)",
  "Status narudžbe",
  "Status plaćanja",
  "Način plaćanja",
  "Dostava",
  "Stripe sesija",
  "Datum kreiranja",
  "Plaćeno",
];

const statusLabels: Record<string, string> = {
  PENDING: "Na čekanju", CONFIRMED: "Potvrđeno", PROCESSING: "U obradi",
  SHIPPED: "Poslano", COMPLETED: "Završeno", CANCELLED: "Otkazano",
  REFUNDED: "Refundirano",
};

const paymentLabels: Record<string, string> = {
  UNPAID: "Nije plaćeno", PENDING: "Plaćanje u tijeku", PAID: "Plaćeno",
  FAILED: "Neuspjelo", CANCELLED: "Otkazano", EXPIRED: "Isteklo",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Kartica (Stripe)", cod: "Pouzeće", bank_transfer: "Bankovna transakcija",
};

function esc(val: string): string {
  return val.includes(",") || val.includes('"') || val.includes("\n")
    ? `"${val.replace(/"/g, '""')}"` : val;
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("orders", "read");
  if (access) return access;

  const body = await req.json().catch(() => ({}));
  const { status, paymentStatus, unread, gls, paymentMethod, dateFrom, dateTo } = body;

  const where: any = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (paymentStatus === "UNPAID") where.status = { notIn: ["CANCELLED", "REFUNDED"] };
  if (unread) where.viewed = false;
  if (gls) { where.shippingMethod = { startsWith: "GLS" }; where.glsShipmentId = null; }
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true, customerName: true, customerEmail: true, customerPhone: true,
      shippingAddress: true, subtotal: true, shippingTotal: true, discountTotal: true, couponCode: true, couponDiscount: true,
       total: true, status: true, paymentStatus: true,
      paymentMethod: true, shippingMethod: true, stripeCheckoutSessionId: true,
      createdAt: true, paidAt: true,
    },
  });

  const header = HEADERS.map(esc).join(",");
  const rows = orders.map(o =>
    [
      esc(o.orderNumber),
      esc(o.customerName),
      esc(o.customerEmail),
      esc(o.customerPhone || ""),
      esc(o.shippingAddress || ""),
      o.subtotal?.toFixed(2) || "0.00",
      o.shippingTotal?.toFixed(2) || "0.00",
      (o.couponDiscount || 0) > 0 ? `-${(o.couponDiscount || 0).toFixed(2)}` : "0.00",
      o.couponCode || "",
      o.total?.toFixed(2) || "0.00",
      esc(statusLabels[o.status] || o.status),
      esc(paymentLabels[o.paymentStatus] || o.paymentStatus),
      esc(paymentMethodLabels[o.paymentMethod] || o.paymentMethod),
      esc(o.shippingMethod || ""),
      esc(o.stripeCheckoutSessionId || ""),
      esc(o.createdAt ? new Date(o.createdAt).toISOString() : ""),
      esc(o.paidAt ? new Date(o.paidAt).toISOString() : ""),
    ].join(",")
  );

  const csv = "\uFEFF" + header + "\n" + rows.join("\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=orders-export.csv" },
  });
}
