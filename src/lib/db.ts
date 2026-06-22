import { PrismaClient } from "@/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient(): PrismaClient {
  // eslint-disable-next-line
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  return new (PrismaClient as any)({
    adapter: new (PrismaBetterSqlite3 as any)({ url: "./prisma/dev.db" }),
  });
}

const handler: ProxyHandler<any> = {
  get(_, prop: string) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = makeClient();
    }
    return (globalForPrisma.prisma as any)[prop];
  },
};

export const db = new Proxy({}, handler) as unknown as PrismaClient;
