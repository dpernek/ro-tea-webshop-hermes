import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const testEmails = ["t@t.hr", "davor@ro-tea.hr", "davor.pernek@ro-tea.hr", "test@ro-tea.hr"];
    
    // Find test orders
    const orders = await db.order.findMany({
      where: { customerEmail: { in: testEmails } },
      select: { id: true }
    });
    const ids = orders.map(o => o.id);
    
    // Delete in order: OrderItems → Payments → Orders
    await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    await db.payment.deleteMany({ where: { orderId: { in: ids } } });
    const result = await db.order.deleteMany({ where: { id: { in: ids } } });
    
    // Reset any leftover orphan records
    await db.orderItem.deleteMany({ where: { orderId: { notIn: ids } } });
    
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
