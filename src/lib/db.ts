import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "";

  if (url.startsWith("postgres")) {
    // @ts-ignore - dynamic require for pg adapter
    const pgModule = require("@prisma/adapter-pg");
    const { PrismaPg } = pgModule;
    return new (PrismaClient as any)({
      adapter: new (PrismaPg as any)({ connectionString: url }),
    });
  }

  // @ts-ignore - SQLite fallback
  const sqliteModule = require("@prisma/adapter-better-sqlite3");
  const { PrismaBetterSqlite3 } = sqliteModule;
  return new (PrismaClient as any)({
    adapter: new (PrismaBetterSqlite3 as any)({ url: url.replace("file:", "") || "./prisma/dev.db" }),
  });
}

const handler: ProxyHandler<any> = {
  get(_, prop: string) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    return (globalForPrisma.prisma as any)[prop];
  },
};

export const db = new Proxy({}, handler) as unknown as PrismaClient;
