import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get("limit") || "1000")));
  const search = url.searchParams.get("search") || "";

  const where: any = { status: "ACTIVE" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, name: true, sku: true, price: true, regularPrice: true, salePrice: true, image: true, featured: true, badge: true, type: true, categoryId: true, brandId: true, shortDescription: true },
    }),
    db.product.count({ where }),
  ]);

  const products = data.map((p) => ({
    ...p,
    oldPrice: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    price: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price,
    category: "", brand: "", // placeholder, populated by client
  }));

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}
