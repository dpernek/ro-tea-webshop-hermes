import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const methods = await db.shippingMethod.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, price: true, freeAboveAmount: true },
  });
  return NextResponse.json(methods);
}
