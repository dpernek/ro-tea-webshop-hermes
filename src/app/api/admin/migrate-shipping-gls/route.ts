import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Delete duplicate GLS records (keep only the most recent ones with 8€/70€)
    const now = new Date();

    // Delete ALL old GLS dostava and GLS Paketomat entries, then recreate
    await (db as any).$executeRawUnsafe(`DELETE FROM "ShippingMethod" WHERE name IN ('GLS dostava', 'GLS Paketomat')`);

    await db.shippingMethod.create({ data: { name: "GLS dostava", price: 8, freeAboveAmount: 70, active: true, sortOrder: 1, updatedAt: now } });
    await db.shippingMethod.create({ data: { name: "GLS Paketomat", price: 8, freeAboveAmount: 70, active: true, sortOrder: 2, updatedAt: now } });

    return NextResponse.json({ ok: true, msg: "GLS methods reset to 8€/70€" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
