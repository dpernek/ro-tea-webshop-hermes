import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const couponUpdateSchema = z.object({
  code: z.string().min(1, "Kod kupona je obavezan").max(50, "Kod kupona može imati najviše 50 znakova").optional(),
  type: z.enum(["PERCENTAGE", "FIXED"], { error: "Tip kupona mora biti PERCENTAGE ili FIXED" }).optional(),
  value: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Vrijednost ne može biti negativna")).optional(),
  active: z.boolean().optional(),
  startsAt: z.preprocess((v) => (v === "" || v === null ? null : v === undefined ? undefined : new Date(v as string)), z.date().nullable().optional()),
  endsAt: z.preprocess((v) => (v === "" || v === null ? null : v === undefined ? undefined : new Date(v as string)), z.date().nullable().optional()),
  usageLimit: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().min(0).nullable()).optional()),
  minimumOrderAmount: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0).nullable()).optional()),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access) return access;
  const { id } = await params;

  const raw = await req.json();
  const parsed = couponUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  await db.coupon.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access) return access;
  const { id } = await params;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
