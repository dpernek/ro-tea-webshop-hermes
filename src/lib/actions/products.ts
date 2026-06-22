"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAuth() {
  // Server actions will be called from client components,
  // middleware already guards the routes.
}

async function slugify(text: string): Promise<string> {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 120);

  // Ensure uniqueness
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }
  return slug;
}

export async function getProducts({
  page = 1,
  pageSize = 20,
  search,
  categoryId,
  brandId,
  status,
  stockStatus,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: string;
  stockStatus?: string;
}) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
  }
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (status) where.status = status;
  if (stockStatus) where.stockStatus = stockStatus;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Naziv je obavezan");

  const slug = String(formData.get("slug") || "") || (await slugify(name));
  const sku = String(formData.get("sku") || "") || null;
  const categoryId = String(formData.get("categoryId") || "") || null;
  const brandId = String(formData.get("brandId") || "") || null;
  const price = parseFloat(String(formData.get("price") || "0"));
  const regularPrice = formData.get("regularPrice")
    ? parseFloat(String(formData.get("regularPrice")))
    : null;
  const salePrice = formData.get("salePrice")
    ? parseFloat(String(formData.get("salePrice")))
    : null;
  const stock = formData.get("stock")
    ? parseInt(String(formData.get("stock")))
    : null;
  const stockStatus = String(formData.get("stockStatus") || "UNKNOWN");
  const status = String(formData.get("status") || "ACTIVE");
  const featured = formData.get("featured") === "on";
  const badge = String(formData.get("badge") || "") || null;
  const type = String(formData.get("type") || "SIMPLE");
  const image = String(formData.get("image") || "/images/placeholder.svg");
  const gallery = String(formData.get("gallery") || "[]");
  const shortDescription = String(formData.get("shortDescription") || "");
  const description = String(formData.get("description") || "");
  const specifications = String(formData.get("specifications") || "{}");
  const metaTitle = String(formData.get("metaTitle") || "") || null;
  const metaDescription = String(formData.get("metaDescription") || "") || null;
  const weight = formData.get("weight")
    ? parseFloat(String(formData.get("weight")))
    : null;
  const width = formData.get("width")
    ? parseFloat(String(formData.get("width")))
    : null;
  const height = formData.get("height")
    ? parseFloat(String(formData.get("height")))
    : null;
  const depth = formData.get("depth")
    ? parseFloat(String(formData.get("depth")))
    : null;
  const taxRate = formData.get("taxRate")
    ? parseFloat(String(formData.get("taxRate")))
    : 25;

  const product = await db.product.create({
    data: {
      slug,
      name,
      sku,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      price,
      regularPrice,
      salePrice,
      taxRate,
      stock,
      stockStatus,
      status,
      featured,
      badge,
      type,
      image,
      gallery,
      shortDescription,
      description,
      specifications,
      metaTitle,
      metaDescription,
      weight,
      width,
      height,
      depth,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/proizvodi");
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Naziv je obavezan");

  const product = await db.product.update({
    where: { id },
    data: {
      name,
      sku: String(formData.get("sku") || "") || null,
      categoryId: String(formData.get("categoryId") || "") || null,
      brandId: String(formData.get("brandId") || "") || null,
      price: parseFloat(String(formData.get("price") || "0")),
      regularPrice: formData.get("regularPrice")
        ? parseFloat(String(formData.get("regularPrice")))
        : null,
      salePrice: formData.get("salePrice")
        ? parseFloat(String(formData.get("salePrice")))
        : null,
      stock: formData.get("stock")
        ? parseInt(String(formData.get("stock")))
        : null,
      stockStatus: String(formData.get("stockStatus") || "UNKNOWN"),
      status: String(formData.get("status") || "ACTIVE"),
      featured: formData.get("featured") === "on",
      badge: String(formData.get("badge") || "") || null,
      type: String(formData.get("type") || "SIMPLE"),
      image: String(formData.get("image") || "/images/placeholder.svg"),
      gallery: String(formData.get("gallery") || "[]"),
      shortDescription: String(formData.get("shortDescription") || ""),
      description: String(formData.get("description") || ""),
      specifications: String(formData.get("specifications") || "{}"),
      metaTitle: String(formData.get("metaTitle") || "") || null,
      metaDescription: String(formData.get("metaDescription") || "") || null,
      weight: formData.get("weight")
        ? parseFloat(String(formData.get("weight")))
        : null,
      width: formData.get("width")
        ? parseFloat(String(formData.get("width")))
        : null,
      height: formData.get("height")
        ? parseFloat(String(formData.get("height")))
        : null,
      depth: formData.get("depth")
        ? parseFloat(String(formData.get("depth")))
        : null,
      taxRate: formData.get("taxRate")
        ? parseFloat(String(formData.get("taxRate")))
        : 25,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/proizvodi/${product.slug}`);
  return product;
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleProductStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.product.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/products");
}
