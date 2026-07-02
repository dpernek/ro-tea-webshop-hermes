import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const access = await requirePermission("customers", "read");
  if (access) return access;
  return NextResponse.json(await db.customer.findMany({
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  }));
}

export async function DELETE() {
  const access = await requirePermission("orders", "write");
  if (access) return access;

  // Only delete customers with no orders (orphaned)
  const allCustomers = await db.customer.findMany({ select: { id: true } });
  let deleted = 0;
  for (const c of allCustomers) {
    const orderCount = await db.order.count({ where: { customerId: c.id } });
    if (orderCount === 0) {
      await db.customer.delete({ where: { id: c.id } });
      deleted++;
    }
  }
  return NextResponse.json({ ok: true, deleted });
}
