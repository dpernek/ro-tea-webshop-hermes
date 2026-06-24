import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  ids: z.array(z.string()).optional().default([]),
  selectAll: z.boolean().optional().default(false),
  filters: z
    .object({
      search: z.string().optional(),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
    })
    .optional(),
  action: z.enum(["salePrice", "status", "stockStatus"]),
  value: z.any(),
});

/** Build the WHERE clause from the same filter params the GET endpoint uses. */
function buildFilterWhere(filters?: {
  search?: string;
  categoryId?: string;
  brandId?: string;
}): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.brandId) {
    where.brandId = filters.brandId;
  }

  return where;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 });
  }

  const parsed = bulkSchema.safeParse(raw);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json({ error: `Neispravni podaci: ${messages}` }, { status: 400 });
  }

  const { ids, selectAll, filters, action, value } = parsed.data;

  // --- Validate value per action ---
  if (action === "salePrice") {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return NextResponse.json(
        { error: "Akcijska cijena mora biti pozitivan broj" },
        { status: 400 },
      );
    }
  } else if (action === "status") {
    if (!["ACTIVE", "DRAFT", "ARCHIVED"].includes(value)) {
      return NextResponse.json(
        { error: "Neispravan status. Dozvoljene vrijednosti: ACTIVE, DRAFT, ARCHIVED" },
        { status: 400 },
      );
    }
  } else if (action === "stockStatus") {
    if (!["INSTOCK", "OUTOFSTOCK", "ONBACKORDER"].includes(value)) {
      return NextResponse.json(
        { error: "Neispravno stanje zalihe. Dozvoljene vrijednosti: INSTOCK, OUTOFSTOCK, ONBACKORDER" },
        { status: 400 },
      );
    }
  }

  // --- Determine target IDs ---
  let targetIds: string[];

  if (selectAll && filters) {
    const where = buildFilterWhere(filters);
    const all = await db.product.findMany({
      where,
      select: { id: true },
    });
    targetIds = all.map((p) => p.id);
  } else {
    targetIds = ids;
  }

  if (targetIds.length === 0) {
    return NextResponse.json({ error: "Nema odabranih proizvoda" }, { status: 400 });
  }

  // --- Build update payload ---
  let data: Record<string, unknown> = {};
  switch (action) {
    case "salePrice":
      data.salePrice = Number(value);
      break;
    case "status":
      data.status = value as string;
      break;
    case "stockStatus":
      data.stockStatus = value as string;
      break;
  }

  // --- Update ---
  const result = await db.product.updateMany({
    where: { id: { in: targetIds } },
    data,
  });

  return NextResponse.json({ updated: result.count });
}
