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

const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Naziv kategorije je obavezan").optional(),
  description: z.string().optional(),
  parentId: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  image: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  sortOrder: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("categories", "write");
  if (access) return access;
  const { id } = await params;

  const raw = await req.json();
  const parsed = categoryUpdateSchema.safeParse(raw);

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

  const cat = await db.category.update({ where: { id }, data });
  await logAction("categories", "update", `Ažurirana kategorija ${cat.name}`, id).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("categories", "write");
  if (access) return access;
  const { id } = await params;

  // Check for existing products before deleting
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { errors: { category: `Nije moguće obrisati kategoriju koja ima ${productCount} proizvoda. Prvo premjestite ili obrišite proizvode.` } },
      { status: 400 }
    );
  }

  const cat = await db.category.delete({ where: { id } });
  await logAction("categories", "delete", `Obrisana kategorija ${cat.name}`, id).catch(() => {});
  return NextResponse.json({ ok: true });
}
