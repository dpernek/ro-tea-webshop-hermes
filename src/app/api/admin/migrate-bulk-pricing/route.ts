import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductBulkOperation" (
        "id" TEXT PRIMARY KEY,
        "type" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT NOW(),
        "createdBy" TEXT NOT NULL,
        "filterSnapshot" TEXT,
        "selectedCount" INTEGER NOT NULL,
        "affectedCount" INTEGER NOT NULL,
        "status" TEXT DEFAULT 'APPLIED',
        "note" TEXT
      )
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductBulkOperationItem" (
        "id" TEXT PRIMARY KEY,
        "operationId" TEXT NOT NULL REFERENCES "ProductBulkOperation"("id"),
        "productId" TEXT NOT NULL,
        "oldPrice" DOUBLE PRECISION,
        "oldRegularPrice" DOUBLE PRECISION,
        "oldSalePrice" DOUBLE PRECISION,
        "newPrice" DOUBLE PRECISION,
        "newRegularPrice" DOUBLE PRECISION,
        "newSalePrice" DOUBLE PRECISION,
        "skipped" BOOLEAN DEFAULT false,
        "skipReason" TEXT
      )
    `);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
