import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

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
