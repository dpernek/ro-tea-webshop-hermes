import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await db.order.count({ where: { viewed: false } });
  return NextResponse.json({ count });
}
