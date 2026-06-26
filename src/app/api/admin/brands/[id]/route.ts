import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const brandUpdateSchema = z.object({
  name: z.string().min(1, "Naziv brenda je obavezan").optional(),
  description: z.string().optional(),
  image: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("brands", "write");
  if (access) return access;
  const { id } = await params;

  const raw = await req.json();
  const parsed = brandUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (data.name && typeof data.name === "string") {
    data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  await db.brand.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("brands", "write");
  if (access) return access;
  const { id } = await params;

  // Check for existing products before deleting
  const productCount = await db.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { errors: { brand: `Nije moguće obrisati brend koji ima ${productCount} proizvoda. Prvo premjestite ili obrišite proizvode.` } },
      { status: 400 }
    );
  }

  await db.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
