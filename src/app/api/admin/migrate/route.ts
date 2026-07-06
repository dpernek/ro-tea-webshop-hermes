import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/migrate — one-time schema migration helper
export async function POST() {
  try {
    // Run raw SQL to create ProductVariant table if it doesn't exist
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProductVariant" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "sku" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "attributes" TEXT NOT NULL,
        "stock" INTEGER,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create unique index if not exists
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_productId_attributes_key" ON "ProductVariant"("productId", "attributes")
    `);

    return NextResponse.json({ ok: true, message: "Migration applied" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
