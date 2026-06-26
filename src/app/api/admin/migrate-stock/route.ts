import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  const result = await db.product.updateMany({
    where: { status: "ACTIVE" },
    data: { stockStatus: "INSTOCK" },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
