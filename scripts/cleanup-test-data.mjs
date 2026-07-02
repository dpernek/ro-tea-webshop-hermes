/**
 * ONE-TIME MAINTENANCE SCRIPT — DO NOT COMMIT TO PRODUCTION WITHOUT REVIEW
 *
 * Wipes all orders, customers, payments, and order-related audit logs.
 * Run manually with: node scripts/cleanup-test-data.mjs
 *
 * REQUIREMENTS:
 * - DATABASE_URL in .env.local
 * - Explicit confirmation required
 * - Audit trail: logs who ran it and what was deleted
 */

const readline = require("readline");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  // Pre-flight counts
  const counts = {
    orders: await db.order.count(),
    orderItems: await db.orderItem.count(),
    payments: await db.payment.count(),
    customers: await db.customer.count(),
    auditLogs: await db.auditLog.count({ where: { resource: "orders" } }),
  };

  console.log("BEFORE:");
  console.log(`  Orders: ${counts.orders}`);
  console.log(`  OrderItems: ${counts.orderItems}`);
  console.log(`  Payments: ${counts.payments}`);
  console.log(`  Customers: ${counts.customers}`);
  console.log(`  Audit logs (orders): ${counts.auditLogs}`);
  console.log();

  // Confirmation
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => {
    rl.question("⚠️  Ovo će trajno obrisati SVE narudžbe, kupce i povezane podatke. Upiši \"DA\" za nastavak: ", resolve);
  });
  rl.close();

  if (answer !== "DA") {
    console.log("Otkazano.");
    process.exit(0);
  }

  const summary = { orders: 0, orderItems: 0, payments: 0, customers: 0, auditLogs: 0 };

  // 1. Order items
  const items = await db.orderItem.deleteMany({});
  summary.orderItems = items.count;

  // 2. Payments
  const pmts = await db.payment.deleteMany({});
  summary.payments = pmts.count;

  // 3. Orders
  const orders = await db.order.deleteMany({});
  summary.orders = orders.count;

  // 4. Customers
  const custs = await db.customer.deleteMany({});
  summary.customers = custs.count;

  // 5. Order audit logs
  const audits = await db.auditLog.deleteMany({ where: { resource: "orders" } });
  summary.auditLogs = audits.count;

  // Leave admin audit trail
  await db.auditLog.create({
    data: {
      userId: "manual",
      userEmail: process.env.USER || "admin",
      resource: "system",
      action: "cleanup",
      summary: `Manual cleanup: ${summary.orders} orders, ${summary.items} items, ${summary.payments} payments, ${summary.customers} customers, ${summary.auditLogs} audit logs`,
    },
  });

  console.log("\nAFTER:");
  console.log(`  Deleted orders: ${summary.orders}`);
  console.log(`  Deleted orderItems: ${summary.orderItems}`);
  console.log(`  Deleted payments: ${summary.payments}`);
  console.log(`  Deleted customers: ${summary.customers}`);
  console.log(`  Deleted audit logs: ${summary.auditLogs}`);
  console.log("✅ Cleanup complete. Audit trail preserved.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
