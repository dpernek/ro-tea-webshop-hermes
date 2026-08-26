"use server";

import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";
import { rankProducts } from "@/lib/search";

// ── shared mapping ──────────────────────────────────────────────



function buildWhere(params: {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sale?: string;
  inStock?: string;
}) {
  const where: any = { status: "ACTIVE" };
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { sku: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  if (params.brandSlug) {
    where.brand = { slug: params.brandSlug };
  }
  if (params.sale === "1") {
    where.salePrice = { not: null };
  }
  if (params.inStock === "1") {
    where.stock = { gt: 0 };
  }
  return where;
}

function buildOrderBy(sort?: string) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "name-desc":
      return { name: "desc" as const };
    default:
      return { name: "asc" as const };
  }
}

const productSelect = {
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
  shortDescription: true,
  stock: true,
  priceRangeMin: true,
  priceRangeMax: true,
  category: { select: { slug: true, name: true } },
  brand: { select: { slug: true, name: true } },
} as const;

// ── server action (called from client on Load More) ────────────

async function queryProductsWithFuzzy(params: {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: string;
  sale?: string;
  inStock?: string;
  skip: number;
  take: number;
}) {
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      select: productSelect,
    }),
    db.product.count({ where }),
  ]);

  // Fuzzy fallback: contains nije našao ništa (tipfeleri, dijakritika) →
  // skeniraj sve aktivne s ostalim filterima i rankaj po Levenshteinu.
  if (params.search && total === 0) {
    const fuzzyWhere = buildWhere({ ...params, search: undefined });
    const all = await db.product.findMany({
      where: fuzzyWhere,
      orderBy: { name: "asc" },
      select: productSelect,
    });
    const ranked = rankProducts(all, params.search);
    return {
      products: ranked
        .slice(params.skip, params.skip + params.take)
        .map((r) => mapProduct(r.item)),
      total: ranked.length,
    };
  }

  return {
    products: rows.map(mapProduct),
    total,
  };
}

export async function loadMoreProducts(params: {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: string;
  sale?: string;
  inStock?: string;
  skip: number;
  take: number;
}) {
  return queryProductsWithFuzzy(params);
}

// ── server-side initial load helpers (used by page.tsx) ────────

export async function loadInitialCatalog(params: {
  search?: string;
  categorySlug?: string;
  brandSlug?: string;
  sort?: string;
  sale?: string;
  inStock?: string;
}) {
  const allowedBrands = [
    "pferd",
    "metabo",
    "festa",
    "delta-plus",
    "knipex",
    "dormer-pramet",
  ];

  // Get product counts per category (manual, avoids _count relation issues)
  const catCounts = await db.product.groupBy({
    by: ["categoryId"],
    where: { status: "ACTIVE", categoryId: { not: null } },
    _count: { id: true },
  });
  const catCountMap: Record<string, number> = {};
  for (const g of catCounts) {
    if (g.categoryId) catCountMap[g.categoryId] = g._count.id;
  }

  const [catalog, categories, brands] = await Promise.all([
    queryProductsWithFuzzy({
      search: params.search,
      categorySlug: params.categorySlug,
      brandSlug: params.brandSlug,
      sort: params.sort,
      sale: params.sale,
      inStock: params.inStock,
      skip: 0,
      take: 24,
    }),
    db.category.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, name: true, description: true, image: true },
    }),
    db.brand.findMany({ select: { id: true, slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    products: catalog.products,
    total: catalog.total,
    categories: categories
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: c.image ?? "",
        count: catCountMap[c.id] || 0,
      }))
      .filter((c) => c.count > 0),
    brands: brands
      .filter((b) => allowedBrands.includes(b.slug))
      .map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        count: 0,
      })),
  };
}
