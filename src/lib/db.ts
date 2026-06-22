import { PrismaClient } from "@/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  // PrismaBetterSqlite3 expects a file path, not a file: URL
  const filePath = url.replace(/^file:/, "");
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: filePath }),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
