import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";

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
      select: {
        id: true,
        slug: true,
        name: true,
        sku: true,
        price: true,
        regularPrice: true,
        salePrice: true,
        image: true,
        featured: true,
        badge: true,
        type: true,
        categoryId: true,
        brandId: true,
        shortDescription: true,
        stock: true,
        priceRangeMin: true,
        priceRangeMax: true,
        category: { select: { slug: true, name: true } },
        brand: { select: { slug: true, name: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  const products = data.map((p) => ({
    ...mapProduct(p),
    categoryId: p.categoryId,
    brandId: p.brandId,
  }));

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}
