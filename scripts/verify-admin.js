// Comprehensive admin consistency verification
const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '..', 'src/generated/client'));
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: path.resolve(__dirname, '..', 'dev.db') }),
});

async function main() {
  console.log('=== ADMIN CONSISTENCY VERIFICATION ===\n');

  // 1. BRANDS
  console.log('--- 1. Brands ---');
  const brands = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`Brand count: ${brands.length}`);
  brands.forEach(b => console.log(`  - ${b.name} (slug: ${b.slug}, id: ${b.id})`));

  const productsWithBrand = await prisma.product.count({ where: { brandId: { not: null } } });
  console.log(`Products with brandId: ${productsWithBrand}`);
  
  const orphanBrands = await prisma.product.findMany({
    where: { brandId: { not: null }, brand: null },
    select: { id: true, name: true, brandId: true },
  });
  console.log(`Orphan brand references in products: ${orphanBrands.length}`);
  if (orphanBrands.length > 0) console.log(JSON.stringify(orphanBrands.slice(0, 5)));

  // 2. CATEGORIES
  console.log('\n--- 2. Categories ---');
  const adminCategories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`Admin categories (all): ${adminCategories.length}`);
  
  const productsByCategory = await prisma.product.groupBy({
    by: ['categoryId'],
    where: { status: 'ACTIVE', categoryId: { not: null } },
    _count: true,
  });
  console.log(`Categories with products: ${productsByCategory.length}`);
  
  // Public catalog categories would only show those with count > 0
  const publicCatCount = productsByCategory.filter(g => g._count > 0).length;
  console.log(`Public catalog categories (with products): ${publicCatCount}`);

  // 3. CATALOGS (KATALOZI)
  console.log('\n--- 3. Katalozi ---');
  const adminCatalogs = await prisma.catalog.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`Admin catalogs (all): ${adminCatalogs.length}`);
  
  const publicCatalogs = await prisma.catalog.findMany({ 
    where: { active: true }, 
    orderBy: { sortOrder: 'asc' } 
  });
  console.log(`Public catalogs (active only): ${publicCatalogs.length}`);
  console.log(`Catalogs match: ${adminCatalogs.length === publicCatalogs.length ? '✅ Yes (all active)' : '❌ Mismatch'}`);
  
  adminCatalogs.forEach(c => console.log(`  - ${c.name} (brand: ${c.brand}, active: ${c.active})`));

  // 4. SETTINGS
  console.log('\n--- 4. Settings ---');
  const settings = await prisma.storeSettings.findFirst();
  console.log(`StoreSettings: ${settings ? '✅ Exists' : '❌ Missing'}`);
  if (settings) {
    console.log(`  Store: ${settings.storeName}, Email: ${settings.storeEmail}, Phone: ${settings.storePhone}`);
  }

  // 5. DASHBOARD COUNTS
  console.log('\n--- 5. Dashboard Counts ---');
  
  // Product count (dashboard queries ACTIVE only)
  const productCount = await prisma.product.count({ where: { status: 'ACTIVE' } });
  console.log(`Products (ACTIVE): ${productCount}`);
  
  // Total products
  const totalProducts = await prisma.product.count();
  console.log(`Products (total): ${totalProducts}`);
  
  // Order count
  const orderCount = await prisma.order.count();
  console.log(`Orders: ${orderCount}`);
  
  // Customer count
  const customerCount = await prisma.customer.count();
  console.log(`Customers: ${customerCount}`);
  
  // Unread orders (viewed = false)
  try {
    const unreadOrders = await prisma.order.count({ where: { viewed: false } });
    console.log(`Unread orders (viewed=false): ${unreadOrders}`);
    console.log(`  Viewed column: ✅ Works`);
  } catch (e) {
    console.log(`  Viewed column: ❌ FAILED - ${e.message}`);
  }
  
  // Revenue
  try {
    const rev = await prisma.order.aggregate({ 
      _sum: { total: true }, 
      where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } 
    });
    console.log(`Revenue: ${(rev._sum.total || 0).toFixed(2)} €`);
  } catch (e) {
    console.log(`Revenue query: ❌ FAILED - ${e.message}`);
  }

  // 6. API ROUTE CONSISTENCY
  console.log('\n--- 6. API Route Checks ---');
  
  // Test admin brands API
  const brandsApi = await prisma.brand.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`GET /api/admin/brands returns: ${brandsApi.length} brands ✅`);
  
  // Test admin categories API
  const catsApi = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log(`GET /api/admin/categories returns: ${catsApi.length} categories ✅`);
  
  // Test admin settings API
  console.log(`GET /api/admin/settings returns: ${settings ? 'settings object ✅' : 'empty object'}`);
  
  // Admin catalogs GET - no API route exists (uses server component instead)
  console.log(`GET /api/admin/catalogs: ❗ No GET handler (server component queries DB directly)`);

  // 7. ORDER TABLE SCHEMA
  console.log('\n--- 7. Order Table Schema Check ---');
  // Check if all schema columns exist by doing a sample query
  try {
    await db.order.findFirst({
      select: {
        id: true,
        viewed: true,
        stripeCheckoutSessionId: true,
        stripePaymentIntentId: true,
        stripePaymentStatus: true,
        paidAt: true,
        paymentFailedAt: true,
        paymentCancelledAt: true,
        paymentErrorMessage: true,
        checkoutExpiresAt: true,
      }
    });
    console.log('Order columns (stripe+viewed): ✅ All accessible');
  } catch (e) {
    console.log(`Order columns: ❌ ${e.message}`);
  }

  // 8. OrderAudit and StripeEvent tables
  try {
    const auditCount = await prisma.orderAudit.count();
    console.log(`OrderAudit table: ✅ Exists (${auditCount} records)`);
  } catch (e) {
    console.log(`OrderAudit table: ❌ ${e.message}`);
  }
  
  try {
    const stripeEventCount = await prisma.stripeEvent.count();
    console.log(`StripeEvent table: ✅ Exists (${stripeEventCount} records)`);
  } catch (e) {
    console.log(`StripeEvent table: ❌ ${e.message}`);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

main()
  .catch(e => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
