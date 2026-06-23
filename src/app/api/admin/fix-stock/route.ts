import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST() {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const r = await db.$executeRawUnsafe('UPDATE "Product" SET "stock" = NULL WHERE "stock" = 0');
  return NextResponse.json({ ok: true, updated: r });
}
