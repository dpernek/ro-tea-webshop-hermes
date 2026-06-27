import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const shippingUpdateSchema = z.object({
  name: z.string().min(1, "Naziv načina dostave je obavezan").optional(),
  description: z.string().optional(),
  price: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Cijena ne može biti negativna")).optional(),
  freeAboveAmount: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable()).optional()),
  active: z.boolean().optional(),
  sortOrder: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("shipping", "write");
  if (access) return access;
  const { id } = await params;

  const raw = await req.json();
  const parsed = shippingUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  await db.shippingMethod.update({ where: { id }, data: parsed.data });
  await logAction("shipping", "update", `Ažurirana dostava`, id).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("shipping", "write");
  if (access) return access;
  const { id } = await params;

  // Guard: don't delete a method that's used in existing orders
  const usedCount = await db.order.count({ where: { shippingMethod: { contains: (await db.shippingMethod.findUnique({ where: { id }, select: { name: true } }))?.name || id } } });
  if (usedCount > 0) {
    // Deactivate instead of deleting
    await db.shippingMethod.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true, deactivated: true, message: "Metoda dostave je deaktivirana jer je korištena u postojećim narudžbama." });
  }

  await db.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
