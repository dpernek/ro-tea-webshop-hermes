import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Create GLS methods using Prisma upsert
    const methods = [
      { id: "gls-dostava-prod", name: "GLS dostava", price: 8, freeAboveAmount: 70, active: true, sortOrder: 1 },
      { id: "gls-paketomat-prod", name: "GLS Paketomat", price: 8, freeAboveAmount: 70, active: true, sortOrder: 2 },
    ];

    for (const m of methods) {
      await db.shippingMethod.upsert({
        where: { id: m.id },
        update: { name: m.name, price: m.price, freeAboveAmount: m.freeAboveAmount, active: m.active, sortOrder: m.sortOrder },
        create: m,
      });
    }

    return NextResponse.json({ ok: true, count: methods.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
