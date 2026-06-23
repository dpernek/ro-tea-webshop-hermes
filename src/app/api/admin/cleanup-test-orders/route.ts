import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const testEmails = ["t@t.hr", "davor@ro-tea.hr", "davor.pernek@ro-tea.hr", "test@ro-tea.hr"];
    
    const orders = await db.order.findMany({
      where: { customerEmail: { in: testEmails } }
    });
    if (orders.length === 0) return NextResponse.json({ ok: true, deleted: 0 });

    const ids = orders.map(o => o.id);

    // 1. Delete items
    await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    // 2. Delete payments
    await db.payment.deleteMany({ where: { orderId: { in: ids } } });
    // 3. Delete orders
    await db.order.deleteMany({ where: { id: { in: ids } } });
    // 4. Delete orphan customers
    await db.customer.deleteMany({ where: { email: { in: testEmails } } });

    return NextResponse.json({ ok: true, deleted: orders.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
