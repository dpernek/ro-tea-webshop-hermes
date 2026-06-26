import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const contentSchema = z.object({
  key: z.string().min(1, "Ključ je obavezan."),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  eyebrow: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  body: z.string().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const access = await requirePermission("content", "read");
  if (access) return access;
  const sections = await db.contentSection.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, key: true, title: true, subtitle: true, eyebrow: true, ctaLabel: true, ctaHref: true, body: true, active: true, sortOrder: true },
  });
  return NextResponse.json(sections);
}

export async function PUT(req: NextRequest) {
  const access = await requirePermission("content", "write");
  if (access) return access;

  const raw = await req.json().catch(() => ({}));
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { key, ...data } = parsed.data;
  const section = await db.contentSection.upsert({
    where: { key },
    update: data,
    create: { key, ...data as any },
  });

  await logAction("content", "edit", `Ažuriran sadržaj: ${key}`, section.id);
  return NextResponse.json(section);
}
