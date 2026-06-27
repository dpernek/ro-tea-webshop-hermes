import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {};
  const fixes: string[] = [];

  for (const table of ["Order", "AuditLog", "ContentSection"]) {
    try {
      const cols = await db.$queryRawUnsafe<Array<{ column_name: string; data_type: string }>>(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, table
      );
      results[table] = { exists: cols.length > 0, columns: cols.map(c => c.column_name) };
    } catch {
      results[table] = { exists: false, columns: [] };
    }
  }

  // Fix Order table
  try {
    const orderCols = results.Order.columns || [];
    const addOrderColumn = async (name: string, sql: string) => {
      if (!orderCols.includes(name)) {
        await db.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN "${name}" ${sql}`);
        fixes.push(`Order.${name} added: ${sql}`);
      }
    };
    await addOrderColumn("shippingTotal", "DOUBLE PRECISION NOT NULL DEFAULT 0");
    await addOrderColumn("discountTotal", "DOUBLE PRECISION NOT NULL DEFAULT 0");
    await addOrderColumn("couponCode", "TEXT");
    await addOrderColumn("couponDiscount", "DOUBLE PRECISION");
    await addOrderColumn("viewed", "BOOLEAN NOT NULL DEFAULT false");
    await addOrderColumn("updatedAt", "TIMESTAMP(3) NOT NULL DEFAULT NOW()");
  } catch (e: any) { fixes.push(`Order fix error: ${e.message}`); }

  // Fix AuditLog table
  try {
    if (!results.AuditLog.exists) {
      await db.$executeRawUnsafe(`CREATE TABLE "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "userEmail" TEXT NOT NULL,
        "resource" TEXT NOT NULL,
        "entityId" TEXT,
        "action" TEXT NOT NULL,
        "summary" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
      )`);
      fixes.push("AuditLog table created");
    }
  } catch (e: any) { fixes.push(`AuditLog fix error: ${e.message}`); }

  // Fix ContentSection table
  try {
    if (!results.ContentSection.exists) {
      await db.$executeRawUnsafe(`CREATE TABLE "ContentSection" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "title" TEXT,
        "subtitle" TEXT,
        "eyebrow" TEXT,
        "ctaLabel" TEXT,
        "ctaHref" TEXT,
        "body" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0
      )`);
      fixes.push("ContentSection table created");
    }
  } catch (e: any) { fixes.push(`ContentSection fix error: ${e.message}`); }

  // Read final state
  const final: any = {};
  for (const table of ["Order", "AuditLog", "ContentSection"]) {
    try {
      const cols = await db.$queryRawUnsafe<Array<{ column_name: string }>>(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, table
      );
      final[table] = cols.map(c => c.column_name);
    } catch { final[table] = []; }
  }

  return NextResponse.json({ results, fixes, final });
}
