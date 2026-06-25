import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Add provider column if missing
    await db.$executeRawUnsafe(`ALTER TABLE "ShippingMethod" ADD COLUMN IF NOT EXISTS "provider" TEXT`);
    await db.$executeRawUnsafe(`ALTER TABLE "ShippingMethod" ADD COLUMN IF NOT EXISTS "slug" TEXT`);
    
    // Upsert GLS methods
    const methods = [
      { slug: "gls-dostava", name: "GLS dostava", price: 6.64, provider: "gls", freeAboveAmount: 66.36, active: true, sortOrder: 1 },
      { slug: "gls-paketomat", name: "GLS Paketomat", price: 6.64, provider: "gls", freeAboveAmount: 66.36, active: true, sortOrder: 2 },
    ];
    
    for (const m of methods) {
      await db.$executeRawUnsafe(
        `INSERT INTO "ShippingMethod" (id, name, price, provider, "freeAboveAmount", active, "sortOrder") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        m.name, m.price, m.provider, m.freeAboveAmount, m.active, m.sortOrder
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
