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

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Naziv trgovine je obavezan").optional(),
  storeEmail: z.string().email("Neispravna email adresa").optional().or(z.literal("")),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currency: z.string().min(1, "Valuta je obavezna").optional(),
  defaultTaxRate: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().min(0, "Porezna stopa ne može biti negativna").max(100, "Porezna stopa ne može biti veća od 100")).optional(),
  freeShippingThreshold: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Prag besplatne dostave ne može biti negativan").nullable().optional())),
});

export async function GET() {
  const access = await requirePermission("settings", "write");
  if (access) {
    return access;
  }

  const settings = await db.storeSettings.findFirst();
  return NextResponse.json(settings || {});
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("settings", "write");
  if (access) {
    return access;
  }

  const raw = await request.json();
  const parsed = storeSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const body = parsed.data;
  const existing = await db.storeSettings.findFirst();

  if (existing) {
    await db.storeSettings.update({
      where: { id: existing.id },
      data: {
        storeName: body.storeName ?? existing.storeName,
        storeEmail: body.storeEmail ?? existing.storeEmail,
        storePhone: body.storePhone ?? existing.storePhone,
        storeAddress: body.storeAddress ?? existing.storeAddress,
        currency: body.currency ?? existing.currency,
        defaultTaxRate: body.defaultTaxRate ?? existing.defaultTaxRate,
        freeShippingThreshold: body.freeShippingThreshold !== undefined ? body.freeShippingThreshold : existing.freeShippingThreshold,
      },
    });
  } else {
    await db.storeSettings.create({
      data: {
        storeName: body.storeName || "RO-TEA",
        storeEmail: body.storeEmail || "",
        storePhone: body.storePhone || "",
        storeAddress: body.storeAddress || "",
        currency: body.currency || "EUR",
        defaultTaxRate: body.defaultTaxRate ?? 25,
        freeShippingThreshold: body.freeShippingThreshold ?? null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
