import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  try {
    await db.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "stockAdjustedAt" TIMESTAMP(3)`);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StripeEvent" (
        "id" TEXT PRIMARY KEY,
        "type" TEXT NOT NULL,
        "objectId" TEXT,
        "payload" TEXT NOT NULL,
        "processed" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP(3) DEFAULT NOW()
      )
    `);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
