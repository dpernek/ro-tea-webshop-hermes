"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";

// GET /api/admin/products/[id]/variants
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("products", "read");
  if (auth) return auth;
  const { id } = await params;

  const variants = await db.productVariant.findMany({
    where: { productId: id },
    select: { id: true, sku: true, price: true, attributes: true, stock: true, active: true },
    orderBy: { price: "asc" },
  });

  return NextResponse.json(variants);
}

// POST /api/admin/products/[id]/variants — create or update variant
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("products", "write");
  if (auth) return auth;
  const { id } = await params;

  const body = await req.json();
  const { sku, price, attributes, stock } = body;

  if (!price || !attributes) {
    return NextResponse.json({ error: "price i attributes su obavezni" }, { status: 400 });
  }

  const attrJson = typeof attributes === "string" ? attributes : JSON.stringify(attributes);

  const variant = await db.productVariant.upsert({
    where: {
      productId_attributes: { productId: id, attributes: attrJson },
    },
    create: {
      productId: id,
      sku: sku ?? null,
      price,
      attributes: attrJson,
      stock: stock ?? null,
    },
    update: {
      sku: sku ?? null,
      price,
      stock: stock ?? null,
    },
    select: { id: true, sku: true, price: true, attributes: true, stock: true },
  });

  return NextResponse.json(variant);
}

// DELETE /api/admin/products/[id]/variants
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("products", "write");
  if (auth) return auth;
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const { variantId } = body;

  if (variantId) {
    await db.productVariant.delete({ where: { id: variantId } });
    return NextResponse.json({ ok: true, deleted: 1 });
  }

  const result = await db.productVariant.deleteMany({ where: { productId: id } });
  return NextResponse.json({ ok: true, deleted: result.count });
}
