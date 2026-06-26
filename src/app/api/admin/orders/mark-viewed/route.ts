import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const access = await requireAdmin();
  if (access) return access;

  const { ids } = await req.json().catch(() => ({}));
  
  if (ids && Array.isArray(ids)) {
    await db.order.updateMany({ where: { id: { in: ids }, viewed: false }, data: { viewed: true } });
  } else {
    await db.order.updateMany({ where: { viewed: false }, data: { viewed: true } });
  }

  return NextResponse.json({ ok: true });
}
