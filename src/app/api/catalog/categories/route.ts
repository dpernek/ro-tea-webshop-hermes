import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cats = await db.category.findMany({
      select: { id: true, slug: true, name: true, description: true, image: true, parentId: true },
    });
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      select: { categoryId: true },
    });
    const countMap: Record<string, number> = {};
    for (const p of products) {
      if (p.categoryId) countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
    }
    const data = cats
      .map((c) => ({ ...c, count: countMap[c.id] || 0 }))
      .filter((c) => c.count > 0);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: "Greška pri dohvaćanju kategorija." }, { status: 500 });
  }
}
