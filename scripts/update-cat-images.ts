// Update category images to use real product photos
import "dotenv/config";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const isPostgres = dbUrl.startsWith("postgres");

let db: PrismaClient;

if (isPostgres) {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: dbUrl }),
  });
} else {
  db = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbUrl }),
  });
}

const updates = [
  { slug: "alati-za-radionice", image: "/images/products/set-profi-122.webp" },
  { slug: "festa-alati", image: "/images/products/led-reflektor-2x20W.webp" },
  { slug: "pferd-alati", image: "/images/products/pba-4-160-hv-mit-pls-8-sw-rgb.webp" },
  { slug: "elektricni-alat-festa", image: "/images/products/xcube001.webp" },
];

for (const { slug, image } of updates) {
  const cat = await db.category.update({
    where: { slug },
    data: { image },
  });
  console.log(`✅ ${cat.slug}: ${cat.image}`);
}

await db.$disconnect();
console.log("Done!");
