import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await auth(); if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const s = await auth(); if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cat = await db.category.create({ data: { ...body, slug, id: slug } });
  return NextResponse.json(cat);
}
