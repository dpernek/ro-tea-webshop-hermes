import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";
import { rankProducts } from "@/lib/search";

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

  // Fuzzy fallback — isti kao actions.ts (paritet data pathova)
  let resultData = data;
  let resultTotal = total;
  if (search && search.trim().length >= 3 && total === 0) {
    const fuzzyWhere = { ...where };
    delete fuzzyWhere.OR;
    const all = await db.product.findMany({
      where: fuzzyWhere,
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
    });
    const ranked = rankProducts(all, search);
    resultData = ranked.slice((page - 1) * limit, (page - 1) * limit + limit).map((r) => r.item);
    resultTotal = ranked.length;
  }

  const products = resultData.map((p) => ({
    ...mapProduct(p),
    categoryId: p.categoryId,
    brandId: p.brandId,
  }));

  return NextResponse.json({ products, total: resultTotal, page, pages: Math.ceil(resultTotal / limit) });
}
