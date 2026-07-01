"use server";

import { db } from "@/lib/db";

// ── shared mapping ──────────────────────────────────────────────

function mapProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku ?? null,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? "",
    categorySlug: p.category?.slug ?? "",
    price: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price,
    regularPrice: p.regularPrice ?? null,
    salePrice: p.salePrice ?? null,
    oldPrice: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    image: p.image,
    gallery: [] as string[],
    shortDescription: p.shortDescription ?? "",
    description: "",
    featured: p.featured ?? false,
    badge: p.badge ?? null,
    type: (p.type?.toLowerCase() ?? "simple") as any,
    stock: p.stock ?? null,
    stockStatus: "unknown" as any,
  };
}

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
  category: { select: { slug: true, name: true } },
  brand: { select: { slug: true, name: true } },
} as const;

// ── server action (called from client on Load More) ────────────

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

  return {
    products: rows.map(mapProduct),
    total,
  };
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
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

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

  const [products, total, categories, brands] = await Promise.all([
    db.product.findMany({
      where,
      skip: 0,
      take: 24,
      orderBy,
      select: productSelect,
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, name: true, description: true, image: true },
    }),
    db.brand.findMany({ select: { id: true, slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    products: products.map(mapProduct),
    total,
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
