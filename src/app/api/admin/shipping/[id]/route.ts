import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

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
  const access = await requireAdmin();
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
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access) return access;
  const { id } = await params;
  await db.shippingMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
