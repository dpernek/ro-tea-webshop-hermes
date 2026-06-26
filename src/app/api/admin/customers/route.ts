import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const access = await requirePermission("customers", "read");
  if (access) return access;
  return NextResponse.json(await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  }));
}
