import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";
import { productSchema, formatZodErrors } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("products", "write");
  if (access)
    return access;
  const { id } = await params;

  // Check if product has orders — don't physically delete
  const orderCount = await db.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: "Proizvod je povezan s narudžbama. Umjesto brisanja arhivirajte ga (status = ARCHIVED)." },
      { status: 400 }
    );
  }

  // Soft delete: archive instead of physical delete
  await db.product.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  return NextResponse.json({ ok: true, archived: true, message: "Proizvod je arhiviran." });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("products", "write");
  if (access)
    return access;
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return NextResponse.json(product || null);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("products", "write");
  if (access)
    return access;

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
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  
  // Slug validation for PATCH — only validate if slug changed
  if (updateData.slug) {
    const newSlug = String(updateData.slug).trim().toLowerCase();
    if (!newSlug) {
      delete updateData.slug;
    } else if (newSlug === existing.slug) {
      // Slug unchanged — keep legacy slug, skip validation
      updateData.slug = existing.slug;
    } else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(newSlug)) {
        return NextResponse.json({ errors: { slug: "Slug mora sadrzavati samo mala slova, brojke i crtice (npr. moj-proizvod)." } }, { status: 400 });
      }
      // Check collision (ignore current product)
      const collides = await db.product.findFirst({ where: { slug: newSlug, id: { not: id } } });
      if (collides) {
        return NextResponse.json({ errors: { slug: `Slug "${newSlug}" vec postoji. Odaberite drugi slug.` } }, { status: 400 });
      }
      updateData.slug = newSlug;
    }
  }
  if (data.sku !== undefined) updateData.sku = data.sku || undefined;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.regularPrice !== undefined) updateData.regularPrice = data.regularPrice === null ? null : data.regularPrice;
  if (data.salePrice !== undefined) updateData.salePrice = data.salePrice === null ? null : data.salePrice;
  if (data.stock !== undefined) updateData.stock = data.stock === null ? 0 : (data.stock ?? 0);
  if (data.stockStatus !== undefined) updateData.stockStatus = data.stockStatus;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.badge !== undefined) updateData.badge = data.badge || undefined;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription || undefined;
  if (data.description !== undefined) updateData.description = data.description || undefined;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.brandId !== undefined) updateData.brandId = data.brandId || undefined;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || undefined;
  if (data.benefits !== undefined) updateData.benefits = data.benefits || undefined;
  if (data.usage !== undefined) updateData.usage = data.usage || undefined;
  if (data.warranty !== undefined) updateData.warranty = data.warranty || undefined;
  if (data.deliveryNote !== undefined) updateData.deliveryNote = data.deliveryNote || undefined;

  // Sale price validation
  const effectiveRegPrice = (updateData.regularPrice as number | null | undefined) ?? (existing.regularPrice ?? existing.price);
  const effectiveSalePrice = (updateData.salePrice as number | null | undefined) ?? existing.salePrice;
  if (effectiveSalePrice != null && effectiveSalePrice > 0 && effectiveSalePrice >= effectiveRegPrice) {
    return NextResponse.json(
      { errors: { salePrice: "Akcijska cijena mora biti manja od redovne cijene." } },
      { status: 400 }
    );
  }

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
