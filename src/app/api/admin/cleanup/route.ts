import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const access = await requirePermission("orders", "write");
  if (access) return access;

  const summary = { orders: 0, orderItems: 0, payments: 0, customers: 0, auditLogs: 0 };

  try {
    // 1. Delete order items (cascade from orders may not work in all Prisma versions)
    const deletedItems = await db.orderItem.deleteMany({});
    summary.orderItems = deletedItems.count;

    // 2. Delete payments
    const deletedPayments = await db.payment.deleteMany({});
    summary.payments = deletedPayments.count;

    // 3. Delete orders
    const deletedOrders = await db.order.deleteMany({});
    summary.orders = deletedOrders.count;

    // 4. Delete customers
    const deletedCustomers = await db.customer.deleteMany({});
    summary.customers = deletedCustomers.count;

    // 5. Clean up order-related audit logs
    const deletedAudit = await db.auditLog.deleteMany({
      where: { resource: "orders" },
    });
    summary.auditLogs = deletedAudit.count;

    await logAction("system", "wipe", `Cleanup: ${summary.orders} orders, ${summary.orderItems} items, ${summary.payments} payments, ${summary.customers} customers, ${summary.auditLogs} audit logs`);

    return NextResponse.json({ ok: true, summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Cleanup failed" }, { status: 500 });
  }
}
