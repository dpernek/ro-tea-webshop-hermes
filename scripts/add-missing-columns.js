// Add missing columns to Order table and create missing tables
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'dev.db');
console.log('Using database:', DB_PATH);

const db = new Database(DB_PATH);

// Enable WAL mode for safety
db.pragma('journal_mode = WAL');

// Get existing columns
const orderCols = db.prepare('PRAGMA table_info("Order")').all();
const colNames = new Set(orderCols.map(c => c.name));

console.log('Existing Order columns:', [...colNames].join(', '));

const additions = [
  { name: 'viewed', type: 'INTEGER', default: '0' },
  { name: 'stripeCheckoutSessionId', type: 'TEXT' },
  { name: 'stripePaymentIntentId', type: 'TEXT' },
  { name: 'stripePaymentStatus', type: 'TEXT' },
  { name: 'paidAt', type: 'DATETIME' },
  { name: 'paymentFailedAt', type: 'DATETIME' },
  { name: 'paymentCancelledAt', type: 'DATETIME' },
  { name: 'paymentErrorMessage', type: 'TEXT' },
  { name: 'checkoutExpiresAt', type: 'DATETIME' },
];

for (const add of additions) {
  if (colNames.has(add.name)) {
    console.log(`Column ${add.name} already exists, skipping.`);
    continue;
  }
  const defaultClause = add.default !== undefined ? ` DEFAULT ${add.default}` : '';
  const sql = `ALTER TABLE "Order" ADD COLUMN "${add.name}" ${add.type}${defaultClause}`;
  console.log('Running:', sql);
  db.prepare(sql).run();
}

// Create OrderAudit table if missing
const orderAuditExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='OrderAudit'").get();
if (!orderAuditExists) {
  console.log('Creating OrderAudit table...');
  db.prepare(`
    CREATE TABLE "OrderAudit" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "changedBy" TEXT NOT NULL,
      "field" TEXT NOT NULL,
      "oldValue" TEXT,
      "newValue" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `).run();
}

// Create StripeEvent table if missing
const stripeEventExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='StripeEvent'").get();
if (!stripeEventExists) {
  console.log('Creating StripeEvent table...');
  db.prepare(`
    CREATE TABLE "StripeEvent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "objectId" TEXT,
      "payload" TEXT NOT NULL,
      "processed" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

// Verify
const updatedCols = db.prepare('PRAGMA table_info("Order")').all();
console.log('\nUpdated Order columns:', updatedCols.map(c => c.name).join(', '));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('All tables:', tables.map(t => t.name).join(', '));

db.close();
console.log('\nDone!');
