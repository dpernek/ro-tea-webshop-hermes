import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const bulkActionEnum = z.enum([
  "discountPercent",
  "increasePercent",
  "decreasePercent",
  "setSalePrice",
  "removeSale",
  "status",
  "stockStatus",
]);

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
  action: bulkActionEnum,
  value: z.any(),
  preview: z.boolean().optional().default(false),
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

/** Validate value based on action type. Returns error message or null. */
function validateValue(
  action: z.infer<typeof bulkActionEnum>,
  value: unknown
): string | null {
  if (action === "discountPercent" || action === "increasePercent" || action === "decreasePercent") {
    const num = Number(value);
    if (isNaN(num) || num <= 0 || num > 100) {
      return "Postotak mora biti broj između 0 i 100";
    }
  } else if (action === "setSalePrice") {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return "Akcijska cijena mora biti pozitivan broj";
    }
  } else if (action === "status") {
    if (!["ACTIVE", "DRAFT", "ARCHIVED"].includes(value as string)) {
      return "Neispravan status. Dozvoljene vrijednosti: ACTIVE, DRAFT, ARCHIVED";
    }
  } else if (action === "stockStatus") {
    if (!["INSTOCK", "OUTOFSTOCK", "ONBACKORDER"].includes(value as string)) {
      return "Neispravno stanje zalihe. Dozvoljene vrijednosti: INSTOCK, OUTOFSTOCK, ONBACKORDER";
    }
  }
  return null;
}

interface ProductForBulk {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
}

interface PreviewItem {
  productId: string;
  productName: string;
  oldPrice: number;
  oldSalePrice: number | null;
  newPrice: number;
  newSalePrice: number | null;
  status: "updated" | "skipped";
  skipReason?: string;
}

interface UpdateResult {
  productId: string;
  oldPrice: number;
  oldSalePrice: number | null;
  newPrice: number;
  newSalePrice: number | null;
  updated: boolean;
  skipReason?: string;
}

/** Compute what the new price/salePrice would be for a product given an action. */
function computeChange(
  product: ProductForBulk,
  action: z.infer<typeof bulkActionEnum>,
  value: number
): UpdateResult {
  const oldPrice = product.price;
  const oldSalePrice = product.salePrice;

  let newPrice = oldPrice;
  let newSalePrice = oldSalePrice;
  let updated = true;
  let skipReason: string | undefined;

  switch (action) {
    case "discountPercent": {
      const discount = value / 100;
      const computed = Math.round(oldPrice * (1 - discount) * 100) / 100;
      if (computed >= oldPrice) {
        updated = false;
        skipReason = "Popust ne bi promijenio cijenu";
      } else if (oldSalePrice != null && oldSalePrice <= computed) {
        updated = false;
        skipReason = "Već postoji bolja akcijska cijena";
      } else {
        newSalePrice = computed;
      }
      break;
    }
    case "increasePercent": {
      const factor = 1 + value / 100;
      newPrice = Math.round(oldPrice * factor * 100) / 100;
      if (oldSalePrice != null) {
        newSalePrice = Math.round(oldSalePrice * factor * 100) / 100;
      }
      break;
    }
    case "decreasePercent": {
      const factor = 1 - value / 100;
      const computed = Math.round(oldPrice * factor * 100) / 100;
      if (computed <= 0) {
        updated = false;
        skipReason = "Nova cijena bi bila 0 ili negativna";
      } else {
        newPrice = computed;
        if (oldSalePrice != null) {
          const newSale = Math.round(oldSalePrice * factor * 100) / 100;
          newSalePrice = newSale > 0 ? newSale : null;
        }
      }
      break;
    }
    case "setSalePrice": {
      if (value >= oldPrice) {
        updated = false;
        skipReason = "Akcijska cijena mora biti manja od redovne";
      } else {
        newSalePrice = value;
      }
      break;
    }
    case "removeSale": {
      if (oldSalePrice == null) {
        updated = false;
        skipReason = "Proizvod nema akcijsku cijenu";
      } else {
        newSalePrice = null;
      }
      break;
    }
    case "status":
    case "stockStatus":
      break;
  }

  return { productId: product.id, oldPrice, oldSalePrice, newPrice, newSalePrice, updated, skipReason };
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
    return NextResponse.json(
      { error: `Neispravni podaci: ${messages}` },
      { status: 400 }
    );
  }

  const { ids, selectAll, filters, action, value, preview } = parsed.data;

  const valError = validateValue(action, value);
  if (valError) {
    return NextResponse.json({ error: valError }, { status: 400 });
  }

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
    return NextResponse.json(
      { error: "Nema odabranih proizvoda" },
      { status: 400 }
    );
  }

  const products: ProductForBulk[] = await db.product.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, price: true, salePrice: true },
  });

  const isPriceAction = [
    "discountPercent",
    "increasePercent",
    "decreasePercent",
    "setSalePrice",
    "removeSale",
  ].includes(action);

  // ── PREVIEW MODE ────────────────────────────────────────────────
  if (preview) {
    if (isPriceAction) {
      const numValue = Number(value);
      const items: PreviewItem[] = products.map((p) => {
        const change = computeChange(p, action as z.infer<typeof bulkActionEnum>, numValue);
        return {
          productId: change.productId,
          productName: p.name,
          oldPrice: change.oldPrice,
          oldSalePrice: change.oldSalePrice,
          newPrice: change.newPrice,
          newSalePrice: change.newSalePrice,
          status: change.updated ? "updated" : "skipped",
          skipReason: change.skipReason,
        };
      });

      const updatedCount = items.filter((i) => i.status === "updated").length;
      const skippedCount = items.filter((i) => i.status === "skipped").length;

      return NextResponse.json({ preview: true, items, updatedCount, skippedCount });
    }

    return NextResponse.json({
      preview: true,
      items: products.map((p) => ({
        productId: p.id,
        productName: p.name,
        oldPrice: p.price,
        oldSalePrice: p.salePrice,
        newPrice: p.price,
        newSalePrice: p.salePrice,
        status: "updated" as const,
      })),
      updatedCount: products.length,
      skippedCount: 0,
    });
  }

  // ── APPLY MODE ──────────────────────────────────────────────────
  const numValue = isPriceAction ? Number(value) : 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const operationItems: Array<{
    productId: string;
    oldPrice: number | null;
    oldRegularPrice: number | null;
    oldSalePrice: number | null;
    newPrice: number | null;
    newRegularPrice: number | null;
    newSalePrice: number | null;
    skipped: boolean;
    skipReason?: string;
  }> = [];

  if (isPriceAction) {
    const changes = products.map((p) =>
      computeChange(p, action as z.infer<typeof bulkActionEnum>, numValue)
    );

    for (const change of changes) {
      const data: Record<string, unknown> = {};
      if (action !== "removeSale" && change.updated) {
        data.price = change.newPrice;
      }
      if (action === "removeSale" && change.updated) {
        data.salePrice = null;
      } else if (action === "setSalePrice" && change.updated) {
        data.salePrice = change.newSalePrice;
      } else if (
        (action === "discountPercent" || action === "increasePercent" || action === "decreasePercent") &&
        change.updated
      ) {
        data.price = change.newPrice;
        data.salePrice = change.newSalePrice;
      }

      if (change.updated) {
        await db.product.update({
          where: { id: change.productId },
          data,
        });
        updatedCount++;
      } else {
        skippedCount++;
      }

      operationItems.push({
        productId: change.productId,
        oldPrice: change.oldPrice,
        oldRegularPrice: change.oldPrice,
        oldSalePrice: change.oldSalePrice,
        newPrice: change.updated ? change.newPrice : change.oldPrice,
        newRegularPrice: change.updated ? change.newPrice : change.oldPrice,
        newSalePrice: change.updated ? change.newSalePrice : change.oldSalePrice,
        skipped: !change.updated,
        skipReason: change.skipReason,
      });
    }
  } else {
    const data: Record<string, unknown> = {};
    if (action === "status") {
      data.status = value as string;
    } else if (action === "stockStatus") {
      data.stockStatus = value as string;
    }

    const result = await db.product.updateMany({
      where: { id: { in: targetIds } },
      data,
    });
    updatedCount = result.count;

    for (const p of products) {
      operationItems.push({
        productId: p.id,
        oldPrice: p.price,
        oldRegularPrice: p.price,
        oldSalePrice: p.salePrice,
        newPrice: p.price,
        newRegularPrice: p.price,
        newSalePrice: p.salePrice,
        skipped: false,
      });
    }
  }

  const operation = await db.productBulkOperation.create({
    data: {
      type: action,
      createdBy: session.user.email || "unknown",
      filterSnapshot: filters ? JSON.stringify(filters) : null,
      selectedCount: products.length,
      affectedCount: updatedCount,
      items: {
        create: operationItems.map((item) => ({
          productId: item.productId,
          oldPrice: item.oldPrice,
          oldRegularPrice: item.oldRegularPrice,
          oldSalePrice: item.oldSalePrice,
          newPrice: item.newPrice,
          newRegularPrice: item.newRegularPrice,
          newSalePrice: item.newSalePrice,
          skipped: item.skipped,
          skipReason: item.skipReason,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({
    operationId: operation.id,
    updated: updatedCount,
    skipped: skippedCount,
  });
}
