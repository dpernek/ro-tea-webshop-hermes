import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    // Update existing GLS methods by name
    const home = await db.shippingMethod.findFirst({ where: { name: "GLS dostava" } });
    const locker = await db.shippingMethod.findFirst({ where: { name: "GLS Paketomat" } });

    if (home) {
      await db.shippingMethod.update({ where: { id: home.id }, data: { price: 8, freeAboveAmount: 70, active: true } });
    } else {
      await db.shippingMethod.create({ data: { name: "GLS dostava", price: 8, freeAboveAmount: 70, active: true, sortOrder: 1, updatedAt: now } });
    }

    if (locker) {
      await db.shippingMethod.update({ where: { id: locker.id }, data: { price: 8, freeAboveAmount: 70, active: true } });
    } else {
      await db.shippingMethod.create({ data: { name: "GLS Paketomat", price: 8, freeAboveAmount: 70, active: true, sortOrder: 2, updatedAt: now } });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
