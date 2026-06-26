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

const brandCreateSchema = z.object({
  name: z.string().min(1, "Naziv brenda je obavezan"),
  description: z.string().default(""),
  image: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
});

export async function GET() {
  const access = await requirePermission("brands", "write");
  if (access) return access;
  return NextResponse.json(await db.brand.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("brands", "write");
  if (access) return access;

  const raw = await req.json();
  const parsed = brandCreateSchema.safeParse(raw);

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

  return NextResponse.json(await db.brand.create({ data: { ...body, slug, id: slug } }));
}
