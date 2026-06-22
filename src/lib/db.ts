import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "";

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    // PostgreSQL via Supabase
    const { PrismaPg } = require("@prisma/adapter-pg") as {
      PrismaPg: new (url: string) => unknown;
    };
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: url }),
    });
  }

  // SQLite (local dev)
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3") as {
    PrismaBetterSqlite3: new (config: { url: string }) => unknown;
  };
  const dbPath = url.replace(/^file:/, "") || "./prisma/dev.db";
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbPath }),
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
