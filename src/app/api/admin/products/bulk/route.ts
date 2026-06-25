import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const bulkActionEnum = z.enum([
  "discountPercent", "increasePercent", "decreasePercent",
  "setSalePrice", "removeSale", "status", "stockStatus",
]);

const saleHandlingEnum = z.enum(["keep", "clear", "recalculateSameDiscount"]).optional().default("keep");

const bulkSchema = z.object({
  ids: z.array(z.string()).optional().default([]),
  selectAll: z.boolean().optional().default(false),
  filters: z.object({ search: z.string().optional(), categoryId: z.string().optional(), brandId: z.string().optional() }).optional(),
  action: bulkActionEnum,
  value: z.any(),
  saleHandling: saleHandlingEnum,
  preview: z.boolean().optional().default(false),
});

const R = (v: number) => Math.round(v * 100) / 100;

function buildFilterWhere(filters?: { search?: string; categoryId?: string; brandId?: string }): Record<string, unknown> {
  const w: Record<string, unknown> = {};
  if (filters?.search) w.OR = [{ name: { contains: filters.search, mode: "insensitive" } }, { sku: { contains: filters.search, mode: "insensitive" } }];
  if (filters?.categoryId) w.categoryId = filters.categoryId;
  if (filters?.brandId) w.brandId = filters.brandId;
  return w;
}

function validateValue(action: string, value: unknown): string | null {
  if (action === "discountPercent") {
    const n = Number(value);
    if (isNaN(n) || n < 0.01 || n > 95) return "Popust mora biti između 0.01 i 95";
  } else if (action === "increasePercent" || action === "decreasePercent") {
    const n = Number(value);
    if (isNaN(n) || n < 0.01 || n > 100) return "Postotak mora biti između 0.01 i 100";
    const n = Number(value);
    if (isNaN(n) || n < 0.01 || n > 100) return "Postotak mora biti između 0.01 i 100";
  } else if (action === "setSalePrice") {
    if (Number(value) < 0) return "Akcijska cijena mora biti pozitivna";
  } else if (action === "status" && !["ACTIVE","DRAFT","ARCHIVED"].includes(value as string)) {
    return "Neispravan status";
  } else if (action === "stockStatus" && !["INSTOCK","OUTOFSTOCK","ONBACKORDER"].includes(value as string)) {
    return "Neispravno stanje zalihe";
  }
  return null;
}

interface ProductFull {
  id: string; name: string; price: number; regularPrice: number | null; salePrice: number | null;
}

interface Change {
  productId: string; productName: string;
  oldPrice: number; oldRegularPrice: number | null; oldSalePrice: number | null;
  newPrice: number; newRegularPrice: number | null; newSalePrice: number | null;
  updated: boolean; skipReason?: string;
}

function computeChange(p: ProductFull, action: string, value: number, saleHandling: string): Change {
  const oldPrice = p.price, oldReg = p.regularPrice, oldSale = p.salePrice;
  let np = oldPrice, nr = oldReg, ns = oldSale;
  let updated = true, skip = "";

  if (action === "discountPercent") {
    // ONLY set salePrice, DON'T touch price or regularPrice
    const sale = R(oldPrice * (1 - value / 100));
    if (sale >= oldPrice) { updated = false; skip = "Popust ne bi promijenio cijenu"; }
    else { ns = sale; }
  } else if (action === "increasePercent" || action === "decreasePercent") {
    const factor = action === "increasePercent" ? 1 + value / 100 : 1 - value / 100;
    np = R(oldPrice * factor);
    if (np < 0.01) { updated = false; skip = "Nova cijena bi bila ispod 0.01 EUR"; }
    else {
      if (oldSale != null) {
        if (saleHandling === "clear") ns = null;
        else if (saleHandling === "recalculateSameDiscount") {
          const oldDiscountRate = oldSale / oldPrice; // e.g. 0.8 for 20% off
          ns = R(np * oldDiscountRate);
          if (ns >= np) ns = null;
        } else { // keep
          if (oldSale >= np) { updated = false; skip = "Akcijska cijena (" + (oldSale ?? 0).toFixed(2) + ") veća od nove redovne (" + np.toFixed(2) + ")"; } else { ns = oldSale; }
        }
      }
    }
  } else if (action === "setSalePrice") {
    if (value >= oldPrice) { updated = false; skip = "Akcijska cijena (" + value.toFixed(2) + ") mora biti manja od redovne (" + oldPrice.toFixed(2) + ")"; }
    else { ns = value; }
  } else if (action === "removeSale") {
    if (oldSale == null) { updated = false; skip = "Proizvod nema akcijsku cijenu"; }
    else { ns = null; }
  }

  return { productId: p.id, productName: p.name, oldPrice, oldRegularPrice: oldReg, oldSalePrice: oldSale, newPrice: np, newRegularPrice: nr, newSalePrice: ns, updated, skipReason: skip || undefined };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 }); }

  const parsed = bulkSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });

  const { ids, selectAll, filters, action, value, preview, saleHandling } = parsed.data;
  const valErr = validateValue(action, value);
  if (valErr) return NextResponse.json({ error: valErr }, { status: 400 });

  let targetIds = selectAll && filters
    ? (await db.product.findMany({ where: buildFilterWhere(filters), select: { id: true } })).map(p => p.id)
    : ids;
  if (!targetIds.length) return NextResponse.json({ error: "Nema odabranih proizvoda" }, { status: 400 });

  const products: ProductFull[] = await db.product.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, price: true, regularPrice: true, salePrice: true },
  });

  const isPriceAction = ["discountPercent","increasePercent","decreasePercent","setSalePrice","removeSale"].includes(action);
  const numValue = isPriceAction ? Number(value) : 0;

  // ── PREVIEW ──
  if (preview) {
    if (isPriceAction) {
      const items = products.map(p => computeChange(p, action, numValue, saleHandling));
      return NextResponse.json({
        preview: true,
        items,
        updatedCount: items.filter(i => i.updated).length,
        skippedCount: items.filter(i => !i.updated).length,
      });
    }
    return NextResponse.json({
      preview: true,
      items: products.map(p => ({ productId: p.id, productName: p.name, oldPrice: p.price, oldRegularPrice: p.regularPrice, oldSalePrice: p.salePrice, newPrice: p.price, newRegularPrice: p.regularPrice, newSalePrice: p.salePrice, updated: true })),
      updatedCount: products.length, skippedCount: 0,
    });
  }

  // ── APPLY IN TRANSACTION ──
  let updatedCount = 0, skippedCount = 0;
  let operationId = "";

  if (isPriceAction) {
    const changes = products.map(p => computeChange(p, action, numValue, saleHandling));

    await db.$transaction(async (tx) => {
      // Create operation record
      const op = await tx.productBulkOperation.create({
        data: {
          type: action, createdBy: session.user?.email || "unknown",
          filterSnapshot: filters ? JSON.stringify(filters) : null,
          selectedCount: products.length, affectedCount: 0,
        },
        select: { id: true },
      });
      operationId = op.id;

      for (const c of changes) {
        let itemOldPrice = c.oldPrice, itemOldReg = c.oldRegularPrice, itemOldSale = c.oldSalePrice;
        let itemNewPrice = c.newPrice, itemNewReg = c.newRegularPrice, itemNewSale = c.newSalePrice;

        if (c.updated) {
          const data: Record<string, unknown> = {};
          if (action === "discountPercent" || action === "setSalePrice") {
            data.salePrice = c.newSalePrice;
          } else if (action === "removeSale") {
            data.salePrice = null;
          } else if (action === "increasePercent" || action === "decreasePercent") {
            data.price = c.newPrice;
            data.salePrice = c.newSalePrice;
          }

          await tx.product.update({ where: { id: c.productId }, data });
          updatedCount++;
        } else {
          skippedCount++;
        }

        await tx.productBulkOperationItem.create({
          data: {
            operationId: op.id, productId: c.productId,
            oldPrice: itemOldPrice, oldRegularPrice: itemOldReg, oldSalePrice: itemOldSale,
            newPrice: itemNewPrice, newRegularPrice: itemNewReg, newSalePrice: itemNewSale,
            skipped: !c.updated, skipReason: c.skipReason,
          },
        });
      }

      await tx.productBulkOperation.update({ where: { id: op.id }, data: { affectedCount: updatedCount } });
    });
  } else {
    // Status / stockStatus
    const data: Record<string, unknown> = {};
    if (action === "status") data.status = value as string;
    else if (action === "stockStatus") data.stockStatus = value as string;

    await db.$transaction(async (tx) => {
      const op = await tx.productBulkOperation.create({
        data: { type: action, createdBy: session.user?.email || "unknown" || "", selectedCount: products.length, affectedCount: 0 },
        select: { id: true },
      });
      operationId = op.id;

      const result = await tx.product.updateMany({ where: { id: { in: targetIds } }, data });
      updatedCount = result.count;

      for (const p of products) {
        await tx.productBulkOperationItem.create({
          data: { operationId: op.id, productId: p.id, oldPrice: p.price, oldRegularPrice: p.regularPrice, oldSalePrice: p.salePrice, newPrice: p.price, newRegularPrice: p.regularPrice, newSalePrice: p.salePrice, skipped: false },
        });
      }

      await tx.productBulkOperation.update({ where: { id: op.id }, data: { affectedCount: updatedCount } });
    });
  }

  return NextResponse.json({ operationId, updated: updatedCount, skipped: skippedCount });
}
