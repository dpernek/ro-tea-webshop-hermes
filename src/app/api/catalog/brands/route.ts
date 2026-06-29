import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      select: { id: true, slug: true, name: true, description: true, image: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json({ error: "Greška pri dohvaćanju brendova." }, { status: 500 });
  }
}
