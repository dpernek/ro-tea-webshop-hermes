import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  const [products, categories, brands] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.brand.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const dataDir = path.join(process.cwd(), "src", "data");

  const productsJson = products.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brandId ? (brands.find(b => b.id === p.brandId)?.name || "") : "",
    category: p.categoryId ? (categories.find(c => c.id === p.categoryId)?.name || "") : "",
    categorySlug: p.categoryId || "",
    categories: JSON.parse(p.categories || "[]"),
    price: p.price,
    regularPrice: p.regularPrice,
    salePrice: p.salePrice,
    oldPrice: null,
    taxRate: p.taxRate,
    image: p.image,
    gallery: JSON.parse(p.gallery || "[]"),
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    specifications: JSON.parse(p.specifications || "{}"),
    stock: p.stock,
    stockStatus: p.stockStatus,
    status: p.status,
    featured: p.featured,
    badge: p.badge,
    type: p.type,
    weight: p.weight,
    width: p.width,
    height: p.height,
    depth: p.depth,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    attributes: JSON.parse(p.attributes || "[]"),
    priceRange: p.priceRangeMin ? { min: p.priceRangeMin, max: p.priceRangeMax || p.priceRangeMin } : undefined,
  }));

  const categoriesJson = categories.map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    parentId: c.parentId,
    image: c.image,
    sortOrder: c.sortOrder,
    status: c.status,
    count: products.filter(p => p.categoryId === c.id).length,
  }));

  const brandsJson = brands.map(b => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    count: products.filter(p => p.brandId === b.id).length,
  }));

  fs.writeFileSync(path.join(dataDir, "products.json"), JSON.stringify(productsJson, null, 2));
  fs.writeFileSync(path.join(dataDir, "categories.json"), JSON.stringify(categoriesJson, null, 2));
  fs.writeFileSync(path.join(dataDir, "brands.json"), JSON.stringify(brandsJson, null, 2));

  return NextResponse.json({ synced: productsJson.length });
}
