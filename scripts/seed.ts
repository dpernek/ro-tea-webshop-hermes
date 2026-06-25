// Seed script: creates admin user and imports products from JSON
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DB_PATH = (process.env.DATABASE_URL || "file:./dev.db").replace(
  /^file:/,
  ""
);
console.log("Using database:", DB_PATH);
const PRODUCTS_JSON = resolve(process.cwd(), "src/data/products.json");
const CATEGORIES_JSON = resolve(process.cwd(), "src/data/categories.json");
const BRANDS_JSON = resolve(process.cwd(), "src/data/brands.json");

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: DB_PATH }),
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD env vars not set, skipping admin seed");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user created: ${email}`);
}

async function seedCategories() {
  if (!existsSync(CATEGORIES_JSON)) {
    console.log("categories.json not found, skipping categories seed");
    return;
  }

  const categories = JSON.parse(readFileSync(CATEGORIES_JSON, "utf-8"));
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description || "",
        image: cat.image || null,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description || "",
        image: cat.image || null,
        sortOrder: 0,
        status: "ACTIVE",
      },
    });
  }
  console.log(`Seeded ${categories.length} categories`);
}

async function seedBrands() {
  if (!existsSync(BRANDS_JSON)) {
    console.log("brands.json not found, skipping brands seed");
    return;
  }

  const brands = JSON.parse(readFileSync(BRANDS_JSON, "utf-8"));
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name },
      create: {
        slug: brand.slug,
        name: brand.name,
      },
    });
  }
  console.log(`Seeded ${brands.length} brands`);
}

async function seedShippingMethods() {
  const methods = [
    {
      name: "Dostava kurirskom službom",
      description: "Dostava na adresu",
      price: 7.0,
      sortOrder: 0,
    },
    {
      name: "Osobno preuzimanje",
      description: "Preuzmite u poslovnici",
      price: 0,
      sortOrder: 1,
    },
  ];

  for (const m of methods) {
    const slug = m.name.toLowerCase().replace(/\s+/g, "-");
    await prisma.shippingMethod.upsert({
      where: { id: slug },
      update: { name: m.name, price: m.price, sortOrder: m.sortOrder },
      create: {
        id: slug,
        name: m.name,
        description: m.description,
        price: m.price,
        sortOrder: m.sortOrder,
        active: true,
      },
    });
  }
  console.log("Seeded shipping methods");
}

async function seedStoreSettings() {
  const existing = await prisma.storeSettings.findFirst();
  if (existing) {
    console.log("Store settings already exist");
    return;
  }

  await prisma.storeSettings.create({
    data: {
      storeName: "RO-TEA",
      storeEmail: "info@ro-tea.hr",
      storePhone: "+385 1 3820 113",
      storeAddress: "Zagreb, Hrvatska",
    },
  });
  console.log("Seeded store settings");
}

async function seedProducts() {
  if (!existsSync(PRODUCTS_JSON)) {
    console.log("products.json not found, skipping products seed");
    return;
  }

  const products = JSON.parse(readFileSync(PRODUCTS_JSON, "utf-8"));
  console.log(`Importing ${products.length} products...`);

  let imported = 0;
  for (const p of products) {
    if (!p.slug || !p.name) continue;

    // Find or create category
    let catId: string | null = null;
    if (p.categorySlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: p.categorySlug },
      });
      catId = cat?.id || null;
    }

    // Find or create brand
    let brandId: string | null = null;
    if (p.brand) {
      const b = await prisma.brand.findFirst({ where: { name: p.brand } });
      brandId = b?.id || null;
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sku: p.sku || null,
        brandId,
        categoryId: catId,
        price: p.price || 0,
        regularPrice: p.regularPrice || null,
        salePrice: p.salePrice || null,
        image: p.image || "/images/placeholder.svg",
        gallery: JSON.stringify(p.gallery || []),
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        specifications: JSON.stringify(p.specifications || {}),
        stock: p.stock || null,
        stockStatus: mapStockStatus(p.stockStatus),
        featured: p.featured || false,
        badge: p.badge || null,
        type: (p.type || "SIMPLE").toUpperCase(),
        attributes: JSON.stringify(p.attributes || []),
        priceRangeMin: p.priceRange?.min || null,
        priceRangeMax: p.priceRange?.max || null,
        categories: JSON.stringify(p.categories || []),
      },
      create: {
        slug: p.slug,
        name: p.name,
        sku: p.sku || null,
        brandId,
        categoryId: catId,
        price: p.price || 0,
        regularPrice: p.regularPrice || null,
        salePrice: p.salePrice || null,
        image: p.image || "/images/placeholder.svg",
        gallery: JSON.stringify(p.gallery || []),
        shortDescription: p.shortDescription || "",
        description: p.description || "",
        specifications: JSON.stringify(p.specifications || {}),
        stock: p.stock || null,
        stockStatus: mapStockStatus(p.stockStatus),
        featured: p.featured || false,
        badge: p.badge || null,
        type: (p.type || "SIMPLE").toUpperCase(),
        attributes: JSON.stringify(p.attributes || []),
        priceRangeMin: p.priceRange?.min || null,
        priceRangeMax: p.priceRange?.max || null,
        categories: JSON.stringify(p.categories || []),
      },
    });
    imported++;
    if (imported % 100 === 0) {
      console.log(`  ... ${imported}/${products.length}`);
    }
  }
  console.log(`Imported ${imported} products`);
}

function mapStockStatus(s: string): string {
  const map: Record<string, string> = {
    instock: "INSTOCK",
    outofstock: "OUTOFSTOCK",
    onbackorder: "ONBACKORDER",
  };
  return map[s?.toLowerCase()] || "UNKNOWN";
}

async function main() {
  console.log("Seeding database...\n");
  await seedAdmin();
  await seedCategories();
  await seedBrands();
  await seedShippingMethods();
  await seedStoreSettings();
  await seedProducts();
  console.log("\nSeed complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
