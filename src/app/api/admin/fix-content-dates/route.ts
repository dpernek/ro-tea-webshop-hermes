import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const fixes: string[] = [];
  // Add missing updatedAt to ContentSection
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "ContentSection" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()`);
    fixes.push("ContentSection.updatedAt added");
  } catch (e: any) { fixes.push(`Error: ${e.message}`); }

  // Re-run verification
  const results: any = {};
  try {
    const orders = await db.order.findMany({ select: { id: true, couponCode: true }, take: 1, orderBy: { createdAt: "desc" } });
    results.orders = { ok: true, hasCouponCode: orders[0] ? "couponCode" in orders[0] : "no rows" };
  } catch (e: any) { results.orders = { ok: false, error: e.message }; }

  try {
    const logs = await db.auditLog.findMany({ select: { id: true }, take: 1 });
    results.auditLog = { ok: true };
  } catch (e: any) { results.auditLog = { ok: false, error: e.message }; }

  try {
    await db.contentSection.upsert({ where: { key: "_verify_test" }, update: { title: "Verify OK" }, create: { key: "_verify_test", title: "Verify OK" } });
    const s = await db.contentSection.findUnique({ where: { key: "_verify_test" }, select: { id: true, key: true, updatedAt: true } });
    results.content = { ok: true, hasUpdatedAt: !!s?.updatedAt, upsertWorks: true };
  } catch (e: any) { results.content = { ok: false, error: e.message }; }

  return NextResponse.json({ fixes, results });
}
