import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const rollbackSchema = z.object({
  operationId: z.string().min(1, "operationId je obavezan"),
});

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

  const parsed = rollbackSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Neispravni podaci: ${parsed.error.issues.map((i) => i.message).join(", ")}` },
      { status: 400 }
    );
  }

  const { operationId } = parsed.data;

  // Find the operation with its items
  const operation = await db.productBulkOperation.findUnique({
    where: { id: operationId },
    include: { items: true },
  });

  if (!operation) {
    return NextResponse.json(
      { error: "Operacija nije pronađena" },
      { status: 404 }
    );
  }

  if (operation.status === "ROLLED_BACK") {
    return NextResponse.json(
      { error: "Ova operacija je već vraćena" },
      { status: 400 }
    );
  }

  let restoredCount = 0;

  // Restore each item that was updated (not skipped)
  for (const item of operation.items) {
    if (item.skipped) continue;

    const updateData: Record<string, unknown> = {};

    // If oldPrice was recorded, restore it
    if (item.oldPrice != null) {
      updateData.price = item.oldPrice;
    }
    // Restore sale price
    if (item.oldSalePrice !== undefined) {
      updateData.salePrice = item.oldSalePrice;
    }

    await db.product.update({
      where: { id: item.productId },
      data: updateData,
    });
    restoredCount++;
  }

  // Mark operation as rolled back
  await db.productBulkOperation.update({
    where: { id: operationId },
    data: { status: "ROLLED_BACK" },
  });

  return NextResponse.json({
    restored: restoredCount,
    operationId,
  });
}
