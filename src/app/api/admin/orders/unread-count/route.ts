import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireAdmin();
  if (access) return access;

  const count = await db.order.count({ where: { viewed: false } });
  return NextResponse.json({ count });
}
