import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const rollbackSchema = z.object({ operationId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (access) return access;

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "Neispravan JSON" }, { status: 400 }); }

  const parsed = rollbackSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });

  const operation = await db.productBulkOperation.findUnique({ where: { id: parsed.data.operationId }, include: { items: true } });
  if (!operation) return NextResponse.json({ error: "Operacija nije pronađena" }, { status: 404 });
  if (operation.status === "ROLLED_BACK") return NextResponse.json({ error: "Ova operacija je već vraćena" }, { status: 400 });

  let restoredCount = 0;

  await db.$transaction(async (tx) => {
    for (const item of operation.items) {
      if (item.skipped) continue;
      const data: Record<string, unknown> = {};
      if (item.oldPrice != null) data.price = item.oldPrice;
      if (item.oldRegularPrice !== undefined) data.regularPrice = item.oldRegularPrice;
      if (item.oldSalePrice !== undefined) data.salePrice = item.oldSalePrice;
      await tx.product.update({ where: { id: item.productId }, data });
      restoredCount++;
    }
    await tx.productBulkOperation.update({ where: { id: parsed.data.operationId }, data: { status: "ROLLED_BACK" } });
  });

  return NextResponse.json({ restored: restoredCount, operationId: parsed.data.operationId });
}
