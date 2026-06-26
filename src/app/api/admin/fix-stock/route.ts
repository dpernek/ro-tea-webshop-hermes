import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST() {
  const access = await requireAdmin();
  if (access) return access;
  const r = await db.$executeRawUnsafe('UPDATE "Product" SET "stock" = NULL WHERE "stock" = 0');
  return NextResponse.json({ ok: true, updated: r });
}
