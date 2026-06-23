import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await db.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "benefits" TEXT');
    await db.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "usage" TEXT');
    await db.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "warranty" TEXT');
    await db.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deliveryNote" TEXT');
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
