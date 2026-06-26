import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  let url = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

  if (url.startsWith("postgres") && url.includes("supabase.co")) {
    const sep = url.includes("?") ? /* & */ String.fromCharCode(38) : "?";
    url = url + sep + "sslmode=no-verify";
    const { PrismaPg } = require("@prisma/adapter-pg");
    return new (PrismaClient as any)({
      adapter: new (PrismaPg as any)({ connectionString: url }),
    });
  }

  if (url.startsWith("postgres")) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    return new (PrismaClient as any)({
      adapter: new (PrismaPg as any)({ connectionString: url }),
    });
  }

  // No valid database URL configured
  throw new Error("DATABASE_URL not configured. Set a valid postgres connection string.");
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
