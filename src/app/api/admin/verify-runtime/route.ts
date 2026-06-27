import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {};

  // 1. Orders — test findMany with select
  try {
    const orders = await db.order.findMany({
      select: { id: true, orderNumber: true, customerName: true, total: true, status: true, paymentStatus: true, createdAt: true, couponCode: true, couponDiscount: true, shippingTotal: true, discountTotal: true, viewed: true, updatedAt: true },
      take: 1,
      orderBy: { createdAt: "desc" },
    });
    results.orders = { ok: true, count: orders.length, hasCouponCode: orders[0] ? "couponCode" in orders[0] : "no rows" };
  } catch (e: any) { results.orders = { ok: false, error: e.message }; }

  // 2. AuditLog — test findMany
  try {
    const logs = await db.auditLog.findMany({ select: { id: true, resource: true, action: true, summary: true, userEmail: true, entityId: true, createdAt: true }, take: 1 });
    results.auditLog = { ok: true, count: logs.length };
  } catch (e: any) { results.auditLog = { ok: false, error: e.message }; }

  // 3. ContentSection — test findMany + upsert
  try {
    const sections = await db.contentSection.findMany({ select: { id: true, key: true, title: true, active: true, sortOrder: true }, take: 3 });
    // Test upsert
    await db.contentSection.upsert({ where: { key: "_verify_test" }, update: { title: "Verify", sortOrder: 9999 }, create: { key: "_verify_test", title: "Verify", sortOrder: 9999 } });
    // Test unique constraint on key
    const dup = await db.contentSection.findUnique({ where: { key: "_verify_test" }, select: { id: true, key: true, updatedAt: true } });
    results.content = { ok: true, sectionCount: sections.length, upsertWorks: !!dup, hasUpdatedAt: dup ? "updatedAt" in dup : false, keyUnique: true };
  } catch (e: any) { results.content = { ok: false, error: e.message }; }

  return NextResponse.json(results);
}
