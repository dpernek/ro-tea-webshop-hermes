import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const couponCreateSchema = z.object({
  code: z.string().min(1, "Kod kupona je obavezan").max(50, "Kod kupona može imati najviše 50 znakova"),
  type: z.enum(["PERCENTAGE", "FIXED"], { error: "Tip kupona mora biti PERCENTAGE ili FIXED" }).default("PERCENTAGE"),
  value: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number({ error: "Vrijednost kupona je obavezna" }).min(0, "Vrijednost ne može biti negativna")),
  active: z.boolean().default(true),
  startsAt: z.preprocess((v) => (v === "" || v === null ? null : v === undefined ? undefined : new Date(v as string)), z.date().nullable().optional()),
  endsAt: z.preprocess((v) => (v === "" || v === null ? null : v === undefined ? undefined : new Date(v as string)), z.date().nullable().optional()),
  usageLimit: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().min(0, "Limit korištenja ne može biti negativan").nullable().optional())),
  minimumOrderAmount: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Minimalni iznos narudžbe ne može biti negativan").nullable().optional())),
});

export async function GET() {
  const access = await requirePermission("coupons", "write");
  if (access) return access;
  return NextResponse.json(await db.coupon.findMany({ select: { id: true, code: true, type: true, value: true, active: true, usageLimit: true, usedCount: true, startsAt: true, endsAt: true, minimumOrderAmount: true, createdAt: true }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("coupons", "write");
  if (access) return access;

  const raw = await req.json();
  const parsed = couponCreateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  return NextResponse.json(await db.coupon.create({ data: parsed.data }));
}
