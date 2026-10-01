import assert from "node:assert/strict";
import { test } from "node:test";
import {
  anchorRowSchema,
  buildPriceList,
  catalogFingerprint,
  euroCents,
  fileTimestamp,
  reviewTemplate,
  validateConfirmation,
  zagrebDate,
} from "../src/lib/compliance/catalog";
import { mapProduct } from "../src/lib/product-mapper";
import { currentProductPrice } from "../src/lib/product-price";

import { sampleProduct } from "./compliance-fixture";

test("unchanged regular price produces a review proposal, never a confirmed anchor", () => {
  const product = sampleProduct({
    price: 80,
    salePrice: 80,
    regularPrice: 100,
    anchorPriceCents: null,
    anchorDate: null,
    anchorRegime: null,
    anchorConfirmedAt: null,
  });
  assert.equal(reviewTemplate([product]).rows[0].anchorPriceCents, 10000);
  assert.equal(mapProduct(product).anchorPriceCents, null);
  assert.ok(
    buildPriceList([product]).errors.some((error) =>
      error.includes("nije potvrđeno")
    )
  );
});

test("CSV keeps current and historical price distinct, handles units, quoting and equal prices", () => {
  const product = sampleProduct({
    name: '=SUM(1;2) "Alat"',
    price: 80,
    salePrice: 60,
    saleLabel: "Akcijska prodaja",
    unitMeasure: "kg",
    unitQuantity: 0.5,
    unitNotApplicable: false,
  });
  const result = buildPriceList([product]);
  assert.deepEqual(result.errors, []);
  assert.ok(result.content.startsWith("\uFEFF"));
  assert.ok(result.content.includes('"\'=SUM(1;2) ""Alat"""'));
  assert.ok(
    result.content.includes(
      '"kg";"120,00";"60,00";"DA";"Akcijska prodaja";"100,00"'
    )
  );
  assert.match(result.content, /\r\n$/);
  assert.ok(
    buildPriceList([sampleProduct()]).content.includes(
      '"100,00";"NE";"";"100,00"'
    )
  );
});

test("incomplete metadata, availability and sale labels block publication", () => {
  const result = buildPriceList([
    sampleProduct({
      barcode: null,
      stock: null,
      stockStatus: "UNKNOWN",
      brand: null,
      unitNotApplicable: false,
      salePrice: 50,
    }),
  ]);
  for (const fragment of [
    "barkod",
    "raspoloživost",
    "marka",
    "jedinica",
    "posebnog oblika",
  ])
    assert.ok(
      result.errors.some((error) => error.includes(fragment)),
      fragment
    );
  assert.ok(buildPriceList([]).errors.length);
});

test("references distinguish 2025 categories and newly listed products", () => {
  const row = reviewTemplate([sampleProduct()]).rows[0];
  assert.ok(anchorRowSchema.safeParse(row).success);
  assert.ok(
    anchorRowSchema.safeParse({
      ...row,
      anchorRegime: "LEGACY_2025",
      anchorDate: "2025-05-02",
    }).success
  );
  assert.ok(
    !anchorRowSchema.safeParse({ ...row, anchorRegime: "LEGACY_2025" }).success
  );
  assert.ok(
    anchorRowSchema.safeParse({
      ...row,
      anchorRegime: "FIRST_LISTED",
      anchorDate: "2026-09-11",
    }).success
  );
  assert.ok(
    !anchorRowSchema.safeParse({
      ...row,
      anchorRegime: "FIRST_LISTED",
      anchorDate: "2026-09-10",
    }).success
  );
  assert.ok(
    !anchorRowSchema.safeParse({ ...row, anchorDate: "2026-02-30" }).success
  );
});

test("catalog changes invalidate the review and confirmed anchors cannot be overwritten", () => {
  const product = sampleProduct();
  const row = anchorRowSchema.parse(reviewTemplate([product]).rows[0]);
  assert.notEqual(
    catalogFingerprint([product]),
    catalogFingerprint([{ ...product, price: 99 }])
  );
  assert.deepEqual(validateConfirmation([product], [row]), []);
  assert.ok(
    validateConfirmation([product], [{ ...row, anchorPriceCents: 9900 }]).some(
      (error) => error.includes("prepisati")
    )
  );
  assert.ok(
    validateConfirmation([product], [row, row]).some((error) =>
      error.includes("ponovljen")
    )
  );
  assert.ok(
    validateConfirmation([product], []).some((error) =>
      error.includes("nedostaje")
    )
  );
});

test("variable products export each variant with its own price and anchor", () => {
  const product = sampleProduct({
    type: "VARIABLE",
    variants: [
      {
        ...sampleProduct(),
        id: "v1",
        attributes: '{"Veličina":"M"}',
        price: 25,
        anchorPriceCents: 2500,
      },
      {
        ...sampleProduct(),
        id: "v2",
        unitMeasure: "kg",
        unitQuantity: 0.5,
        unitNotApplicable: false,
        attributes: '{"Veličina":"L"}',
        price: 30,
        anchorPriceCents: 2800,
      },
    ],
  });
  const result = buildPriceList([product]);
  assert.deepEqual(result.errors, []);
  assert.equal(result.rowCount, 2);
  assert.ok(result.content.includes('"kg";"60,00";"30,00"'));
  assert.ok(result.content.includes('"30,00";"NE";"";"28,00"'));
  assert.equal(mapProduct(product).anchorPriceCents, 2500);
  assert.equal(mapProduct(product).price, 25);
  assert.ok(
    buildPriceList([{ ...product, variants: [] }]).errors.some((error) =>
      error.includes("varijanti")
    )
  );
});

test("Zagreb local dates and filenames account for midnight and daylight saving", () => {
  assert.equal(zagrebDate(new Date("2026-09-30T22:30:00Z")), "2026-10-01");
  assert.equal(
    fileTimestamp(new Date("2026-10-01T04:00:00Z")),
    "2026-10-01_06-00-00"
  );
  assert.equal(
    fileTimestamp(new Date("2026-12-01T04:00:00Z")),
    "2026-12-01_05-00-00"
  );
});

test("invalid sale prices never become the selling price", () => {
  for (const salePrice of [null, 0, -10, 100, 120, NaN])
    assert.equal(currentProductPrice({ price: 100, salePrice }), 100);
  assert.equal(currentProductPrice({ price: 100, salePrice: 80 }), 80);
  assert.equal(euroCents(19.99), 1999);
  assert.throws(() => euroCents(NaN));
});
