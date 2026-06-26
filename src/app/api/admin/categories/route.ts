import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const categoryCreateSchema = z.object({
  name: z.string().min(1, "Naziv kategorije je obavezan"),
  description: z.string().default(""),
  parentId: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  image: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  sortOrder: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().int().default(0)),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

export async function GET() {
  const access = await requireAdmin();
  if (access) return access;
  const data = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const access = await requireAdmin();
  if (access) return access;

  const raw = await req.json();
  const parsed = categoryCreateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const body = parsed.data;
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const cat = await db.category.create({ data: { ...body, slug, id: slug } });
  await logAction("categories", "create", `Kreirana kategorija ${cat.name}`, cat.id);
  return NextResponse.json(cat);
}
