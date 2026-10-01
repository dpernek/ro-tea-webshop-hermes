import assert from "node:assert/strict";
import { test } from "node:test";
import { checkoutSchema, manualCheckoutSchema } from "../src/lib/checkout-validation";
import { computePrices } from "../src/lib/pricing";
import { includedVat } from "../src/lib/tax";
import { calculateShippingTotal } from "../src/lib/shipping-pricing";

const input = {
  customerName: "Ivan Horvat", customerEmail: "ivan@example.com",
  customerPhone: "0911234567", address: "Ulica 1", city: "Zagreb", postalCode: "10000",
  items: [{ productId: "adapter", quantity: 1 }], shippingMethodId: "gls",
};
const delivery = { name: "GLS", active: true, price: 8, freeAboveAmount: 70 };

test("VAT is extracted from gross prices and follows the sale price", () => {
  const result = computePrices([{ productId: "adapter", quantity: 1, price: 10, salePrice: 8 }]);
  assert.equal(result.subtotal, 8);
  assert.equal(result.tax, 1.6);
  assert.equal(result.lineItems[0].unitPrice, 8);
  assert.equal(includedVat(result.subtotal), result.tax);
  assert.equal(computePrices([{ productId: "tool", quantity: 3, price: 19.99 }]).tax, 11.99);
  assert.equal(includedVat(0), 0);
});

test("invalid sale prices do not change the gross price", () => {
  for (const salePrice of [null, 0, -1, 10, 12]) {
    const result = computePrices([{ productId: "tool", quantity: 2, price: 10, salePrice }]);
    assert.equal(result.subtotal, 20);
    assert.equal(result.tax, 4);
  }
});

test("both checkout paths reject quantities that could corrupt totals or stock", () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, "1", null, Number.MAX_SAFE_INTEGER + 1]) {
    const raw = { ...input, paymentMethod: "cod", items: [{ productId: "adapter", quantity }] };
    assert.equal(checkoutSchema.safeParse(raw).success, false, String(quantity));
    assert.equal(manualCheckoutSchema.safeParse(raw).success, false, String(quantity));
  }
});

test("empty and duplicate product entries are rejected in both paths", () => {
  for (const items of [[], [...input.items, ...input.items], [{ productId: " ", quantity: 1 }]]) {
    const raw = { ...input, paymentMethod: "bank_transfer", items };
    assert.equal(checkoutSchema.safeParse(raw).success, false);
    assert.equal(manualCheckoutSchema.safeParse(raw).success, false);
  }
});

test("client prices and totals cannot override server calculations", () => {
  const raw = {
    ...input, paymentMethod: "cod", shippingTotal: -8, subtotal: 0, taxTotal: 0, total: 0,
    items: [{ productId: "adapter", quantity: 1, unitPrice: 0, productName: "Forged name" }],
  };
  const parsed = manualCheckoutSchema.parse(raw);
  assert.equal("shippingTotal" in parsed, false);
  assert.equal("subtotal" in parsed, false);
  assert.equal("taxTotal" in parsed, false);
  assert.equal("total" in parsed, false);
  assert.deepEqual(parsed.items, input.items);
  const pricing = computePrices(parsed.items.map(item => ({ ...item, price: 8 })));
  assert.equal(pricing.subtotal + calculateShippingTotal(delivery, pricing.subtotal), 16);
});

test("manual checkout accepts only the two supported manual payment methods", () => {
  for (const paymentMethod of ["cod", "bank_transfer"]) {
    assert.equal(manualCheckoutSchema.safeParse({ ...input, paymentMethod }).success, true);
  }
  for (const paymentMethod of ["card", "free", "", null]) {
    assert.equal(manualCheckoutSchema.safeParse({ ...input, paymentMethod }).success, false);
  }
});

test("shipping is charged below the threshold and free starting at the threshold", () => {
  assert.equal(calculateShippingTotal(delivery, 69.99), 8);
  assert.equal(calculateShippingTotal(delivery, 70), 0);
  assert.equal(calculateShippingTotal(delivery, 100), 0);
  assert.equal(calculateShippingTotal({ ...delivery, freeAboveAmount: null }, 100), 8);
  assert.equal(calculateShippingTotal({ ...delivery, name: "Osobno preuzimanje", price: 0 }, 8), 0);
});

test("missing or inactive shipping methods cannot silently grant free delivery", () => {
  assert.throws(() => calculateShippingTotal(null, 8), /više nije dostupan/);
  assert.throws(() => calculateShippingTotal({ ...delivery, active: false }, 100), /više nije dostupan/);
});

test("parcel lockers require a pickup point even above the free shipping threshold", () => {
  const locker = { ...delivery, name: "GLS Paketomat" };
  assert.throws(() => calculateShippingTotal(locker, 100), /odaberite GLS paketomat/);
  assert.throws(() => calculateShippingTotal(locker, 8, " "), /odaberite GLS paketomat/);
  assert.equal(calculateShippingTotal(locker, 8, "locker-1"), 8);
  assert.equal(calculateShippingTotal(locker, 70, "locker-1"), 0);
});
