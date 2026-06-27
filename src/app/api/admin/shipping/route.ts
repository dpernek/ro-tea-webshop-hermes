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

const shippingCreateSchema = z.object({
  name: z.string().min(1, "Naziv načina dostave je obavezan"),
  description: z.string().default(""),
  price: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number({ error: "Cijena dostave je obavezna" }).min(0, "Cijena ne može biti negativna")),
  freeAboveAmount: z.preprocess(emptyStringToNull, z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().min(0, "Prag besplatne dostave ne može biti negativan").nullable().optional())),
  active: z.boolean().default(true),
  sortOrder: z.preprocess((v) => (v === "" || v === undefined ? 0 : Number(v)), z.number().int().default(0)),
});

export async function GET() {
  const access = await requirePermission("shipping", "read");
  if (access) return access;
  return NextResponse.json(await db.shippingMethod.findMany({ select: { id: true, name: true, description: true, price: true, freeAboveAmount: true, active: true, sortOrder: true }, orderBy: { sortOrder: "asc" } }));
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("shipping", "write");
  if (access) return access;

  const raw = await req.json();
  const parsed = shippingCreateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const body = parsed.data;
  const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const method = await db.shippingMethod.create({ data: { ...body, id } });
  await logAction("shipping", "create", `Dodana dostava: ${method.name}`, method.id).catch(() => {});
  return NextResponse.json(method);
}
