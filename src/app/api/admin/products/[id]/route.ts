import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema, formatZodErrors } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return NextResponse.json(product || null);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify product exists
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Proizvod nije pronađen." }, { status: 404 });

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Neispravan JSON format." },
      { status: 400 }
    );
  }

  // Sanitize: convert empty strings to null/undefined where appropriate
  const sanitized = sanitizeInput(body as Record<string, unknown>);

  // Validate with Zod — partial for PATCH (all fields optional)
  const patchSchema = productSchema.partial();
  const result = patchSchema.safeParse(sanitized);
  if (!result.success) {
    return NextResponse.json(
      { errors: formatZodErrors(result.error) },
      { status: 400 }
    );
  }

  const data = result.data;

  // Whitelist: only pass known fields to Prisma
  // Optional string fields use undefined (not null) for Prisma compatibility
  const updateData = {
    name: data.name,
    slug: data.slug,
    sku: data.sku || undefined,
    price: data.price,
    regularPrice: data.regularPrice ?? null,
    salePrice: data.salePrice ?? null,
    stock: data.stock ?? 0,
    stockStatus: data.stockStatus,
    status: data.status,
    featured: data.featured,
    badge: data.badge || undefined,
    type: data.type,
    shortDescription: data.shortDescription || undefined,
    description: data.description || undefined,
    image: data.image,
    brandId: data.brandId || undefined,
    categoryId: data.categoryId || undefined,
  };

  try {
    const updated = await db.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ ok: true, product: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Greška pri ažuriranju proizvoda u bazi." },
      { status: 500 }
    );
  }
}

/**
 * Sanitize incoming form data:
 * - Convert empty strings to null for optional numeric fields (prevents NaN)
 * - Trim string values
 */
function sanitizeInput(
  body: Record<string, unknown>
): Record<string, unknown> {
  const numericKeys = ["regularPrice", "salePrice", "stock", "sortOrder"];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      // Empty string for numeric fields → null
      if (trimmed === "" && numericKeys.includes(key)) {
        sanitized[key] = null;
      } else {
        sanitized[key] = trimmed;
      }
    } else if (value === null || value === undefined) {
      sanitized[key] = null;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
