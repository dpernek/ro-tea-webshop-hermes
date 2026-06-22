import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const pgUrl = process.env.POSTGRES_PRISMA_URL;

  if (pgUrl) {
    // Vercel + Supabase: PostgreSQL via pg adapter
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(String.fromCharCode(64, 112, 114, 105, 115, 109, 97, 47, 97, 100, 97, 112, 116, 101, 114, 45, 112, 103));
    const { PrismaPg } = m;
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: pgUrl }),
    });
  }

  // Local dev: SQLite
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require(String.fromCharCode(64, 112, 114, 105, 115, 109, 97, 47, 97, 100, 97, 112, 116, 101, 114, 45, 98, 101, 116, 116, 101, 114, 45, 115, 113, 108, 105, 116, 101, 51));
  const { PrismaBetterSqlite3 } = m;
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: "./prisma/dev.db" }),
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
