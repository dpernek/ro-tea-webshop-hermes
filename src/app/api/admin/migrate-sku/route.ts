import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let updated = 0;
  let failed = 0;

  const products = await db.product.findMany({
    where: { shortDescription: { contains: "Kataloški broj" } },
    select: { id: true, slug: true, shortDescription: true },
  });

  for (const p of products) {
    const match = (p.shortDescription || "").match(/Kataloški broj:\s*(\S+)/);
    if (!match) continue;

    const sku = match[1].trim();
    const cleanDesc = (p.shortDescription || "")
      .replace(/Kataloški broj:\s*\S+\s*/g, "")
      .trim();

    try {
      await db.product.update({
        where: { id: p.id },
        data: { sku, shortDescription: cleanDesc || "" },
      });
      updated++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, updated, failed, total: products.length });
}
