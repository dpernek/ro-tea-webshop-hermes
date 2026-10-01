import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";

// Constructor only; these tests reject requests before contacting Stripe.
process.env.STRIPE_SECRET_KEY = "sk_test_regression_placeholder";
const checkoutRoute = import("../src/app/api/stripe/create-checkout-session/route");
const input = {
  customerName: "Ivan Horvat", customerEmail: "ivan@example.com",
  customerPhone: "0911234567", address: "Ulica 1", city: "Zagreb", postalCode: "10000",
  items: [{ productId: "adapter", quantity: 1 }], shippingMethodId: "gls",
};
function request(body: unknown) {
  return new NextRequest("http://localhost/api/stripe/create-checkout-session", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

test("Stripe endpoint rejects invalid quantities and duplicate items before database access", async () => {
  const { POST } = await checkoutRoute;
  (globalThis as unknown as { prisma: unknown }).prisma = new Proxy({}, {
    get() { throw new Error("Invalid request reached the database"); },
  });
  try {
    for (const items of [
      [{ productId: "adapter", quantity: -1 }],
      [{ productId: "adapter", quantity: 0 }],
      [{ productId: "adapter", quantity: 1.5 }],
      [...input.items, ...input.items],
    ]) {
      const response = await POST(request({ ...input, items }));
      assert.equal(response.status, 400);
      const data = await response.json();
      assert.ok(data.errors);
    }
  } finally {
    delete (globalThis as unknown as { prisma?: unknown }).prisma;
  }
});

test("Stripe endpoint rejects inactive shipping and unselected lockers before creating an order", async () => {
  const { POST } = await checkoutRoute;
  for (const method of [
    { name: "GLS", active: false, price: 8, freeAboveAmount: 70 },
    { name: "GLS Paketomat", active: true, price: 8, freeAboveAmount: 70 },
  ]) {
    (globalThis as unknown as { prisma: unknown }).prisma = {
      product: { findMany: async () => [{ id: "adapter", name: "Adapter", status: "ACTIVE", stock: 5, price: 8, salePrice: null }] },
      shippingMethod: { findUnique: async () => method },
      order: { create: async () => { throw new Error("Rejected shipping reached order creation"); } },
    };
    try {
      const response = await POST(request(input));
      assert.equal(response.status, 400);
      const data = await response.json();
      assert.match(data.error, /više nije dostupan|odaberite GLS paketomat/);
    } finally {
      delete (globalThis as unknown as { prisma?: unknown }).prisma;
    }
  }
});
