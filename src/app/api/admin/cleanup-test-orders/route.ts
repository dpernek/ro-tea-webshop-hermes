import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const access = await requireAdmin();
  if (access) return access;

  try {
    // Delete ALL test orders created during development
    const orders = await db.order.findMany({ select: { id: true } });
    if (orders.length === 0) return NextResponse.json({ ok: true, deleted: 0 });

    const ids = orders.map(o => o.id);

    await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    await db.payment.deleteMany({ where: { orderId: { in: ids } } });
    await db.order.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({ ok: true, deleted: orders.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
