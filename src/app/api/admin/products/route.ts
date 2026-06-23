import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const productCreateSchema = z.object({
  name: z.string().min(1, "Naziv proizvoda je obavezan"),
  sku: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  brandId: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  categoryId: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  price: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number({ error: "Cijena je obavezna" }).min(0, "Cijena ne može biti negativna")),
  regularPrice: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Redovna cijena ne može biti negativna").nullable().optional())),
  salePrice: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Akcijska cijena ne može biti negativna").nullable().optional())),
  taxRate: z.preprocess((v) => (v === "" || v === null || v === undefined ? 25 : Number(v)), z.number().min(0).max(100).optional().default(25)),
  image: z.string().default(""),
  gallery: z.string().default("[]"),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  specifications: z.string().default("{}"),
  stock: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().min(0, "Zaliha ne može biti negativna").nullable().optional())),
  stockStatus: z.enum(["INSTOCK", "OUTOFSTOCK", "ONBACKORDER", "UNKNOWN"]).default("UNKNOWN"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.preprocess((v) => v === true || v === "true", z.boolean().default(false)),
  badge: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  type: z.enum(["SIMPLE", "VARIABLE", "UNKNOWN"]).default("SIMPLE"),
  weight: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  width: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  height: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  depth: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  metaTitle: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  metaDescription: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  attributes: z.string().default("[]"),
  priceRangeMin: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  priceRangeMax: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable().optional())),
  categories: z.string().default("[]"),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, price: true, salePrice: true, regularPrice: true, status: true, image: true },
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await request.json();
  const parsed = productCreateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const body = parsed.data;
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const product = await db.product.create({ data: { ...body, slug } });
  return NextResponse.json(product);
}
