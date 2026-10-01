import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { GET } from "../src/app/api/catalog/products/route";

function stubCatalog(featuredCount: number) {
  const queries: Array<{ where: Record<string, unknown>; take: number; skip: number }> = [];
  const counts: Array<{ where: Record<string, unknown> }> = [];
  const product = {
    id: "tool", slug: "tool", name: "Tool", sku: null, price: 10, salePrice: 8,
    image: "/tool.webp", featured: featuredCount > 0, type: "SIMPLE",
  };
  const prismaStub = {
    product: {
      count: async (query: { where: Record<string, unknown> }) => {
        counts.push(query);
        return counts.length === 1 ? featuredCount : 16;
      },
      findMany: async (query: typeof queries[number]) => {
        queries.push(query);
        return Array.from({ length: query.take }, (_, i) => ({ ...product, id: `tool-${i}` }));
      },
    },
  };
  // The existing lazy DB proxy permits a test client without opening a database.
  (globalThis as unknown as { prisma: unknown }).prisma = prismaStub;
  return { queries, counts };
}

test("homepage selects featured products across the catalog and returns at most eight", async () => {
  const { queries, counts } = stubCatalog(16);
  try {
    const response = await GET(new NextRequest("http://localhost/api/catalog/products?home=true&limit=1000&page=2"));
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(counts[0].where, { status: "ACTIVE", featured: true });
    assert.deepEqual(queries[0].where, { status: "ACTIVE", featured: true });
    assert.equal(queries[0].take, 8);
    assert.equal(queries[0].skip, 0);
    assert.equal(data.products.length, 8);
    assert.equal(data.products[0].price, 8);
  } finally {
    delete (globalThis as unknown as { prisma?: unknown }).prisma;
  }
});

test("homepage without featured products selects priced products with real images", async () => {
  const { queries } = stubCatalog(0);
  try {
    const response = await GET(new NextRequest("http://localhost/api/catalog/products?home=true"));
    const data = await response.json();
    assert.deepEqual(queries[0].where, {
      status: "ACTIVE", price: { gt: 0 }, image: { not: "/images/placeholder.svg" },
    });
    assert.equal(queries[0].take, 8);
    assert.equal(data.products.length, 8);
    assert.equal(data.products[0].featured, false);
  } finally {
    delete (globalThis as unknown as { prisma?: unknown }).prisma;
  }
});
