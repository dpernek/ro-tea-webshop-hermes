import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const dynamic = "force-dynamic";

const catalogSchema = z.object({
  name: z.string().min(1, "Naziv je obavezan."),
  brand: z.string().optional().default(""),
  description: z.string().optional().default(""),
  fileUrl: z.string().min(1, "URL datoteke je obavezan."),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0, "Sort mora biti >= 0").default(0),
});

export async function GET() {
  const access = await requirePermission("catalogs", "read");
  if (access) return access;
  const catalogs = await db.catalog.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(catalogs);
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("catalogs", "write");
  if (access) return access;

  const raw = await request.json();
  const parsed = catalogSchema.safeParse({
    name: raw.name,
    brand: raw.brand,
    description: raw.description,
    fileUrl: raw.fileUrl,
    active: raw.active === "false" ? false : raw.active !== false,
    sortOrder: parseInt(raw.sortOrder) || 0,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".");
      if (!errors[field]) errors[field] = issue.message;
    }
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { name, brand, description, fileUrl, active, sortOrder } = parsed.data;
  await db.catalog.create({ data: { name, brand, description, fileUrl, active, sortOrder } });
  revalidatePath("/admin/katalozi");
  return NextResponse.json({ success: true });
}
