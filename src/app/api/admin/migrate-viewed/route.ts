import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "viewed" BOOLEAN DEFAULT false`);
    return NextResponse.json({ ok: true, message: "Kolumna 'viewed' dodana" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
