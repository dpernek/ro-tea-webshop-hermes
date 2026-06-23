import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.product.updateMany({
    where: { status: "ACTIVE" },
    data: { stockStatus: "INSTOCK" },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
