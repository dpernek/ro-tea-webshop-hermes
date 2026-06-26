import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cat = await db.category.findUnique({ where: { slug: "brusni-alati" }, select: { name: true, description: true } });
    return NextResponse.json({ ok: true, cat });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, code: e.code }, { status: 500 });
  }
}
