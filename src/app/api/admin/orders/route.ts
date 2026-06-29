import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await requirePermission("orders", "read");
  if (access) return access;
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const status = url.searchParams.get("status") || "";
  const paymentStatus = url.searchParams.get("paymentStatus") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";
  const unread = url.searchParams.get("unread") || "";
  const gls = url.searchParams.get("gls") || "";
  const paymentMethod = url.searchParams.get("paymentMethod") || "";

  const where: any = {};
  if (status) where.status = status;
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
    // Match dashboard: exclude CANCELLED/REFUNDED orders from unpaid count
    if (paymentStatus === "UNPAID") where.status = { notIn: ["CANCELLED", "REFUNDED"] };
  }
  if (unread === "1") where.viewed = false;
  if (gls === "1") { where.shippingMethod = { startsWith: "GLS" }; where.glsShipmentId = null; }
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      // Include the entire "to" day by setting to end of day
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = toDate;
    }
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, customerEmail: true, total: true, shippingTotal: true, discountTotal: true, couponCode: true, couponDiscount: true, status: true, paymentStatus: true, paymentMethod: true, shippingMethod: true, createdAt: true, viewed: true, updatedAt: true } }),
    db.order.count({ where }),
  ]);
  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) });
}
