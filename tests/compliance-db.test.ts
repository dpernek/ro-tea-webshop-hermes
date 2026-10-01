import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Prisma } from "../src/generated/client";
import { applyConfirmation } from "../src/lib/compliance/apply-confirmation";

// The pre-existing columns touched by this migration; all new tables come from
// the real migration, tested on PostgreSQL compiled to WASM.
const baseline = `
CREATE TABLE "Product" (id TEXT PRIMARY KEY, price DOUBLE PRECISION NOT NULL, stock INTEGER, "stockStatus" TEXT NOT NULL DEFAULT 'UNKNOWN', "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ProductVariant" (id TEXT PRIMARY KEY, "productId" TEXT NOT NULL REFERENCES "Product"(id), price DOUBLE PRECISION NOT NULL, stock INTEGER, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT INTO "Product" (id, price) VALUES ('simple', 100), ('variable', 999);
INSERT INTO "ProductVariant" (id, "productId", price) VALUES ('v1', 'variable', 25), ('v2', 'variable', 30);
`;

test("PostgreSQL migration, bulk confirmation and evidence guards work together", async () => {
  const pg = new PGlite();
  try {
    await pg.exec(baseline);
    await pg.exec(
      await readFile(
        new URL(
          "../prisma/migrations/20261001120000_legal_price_lists/migration.sql",
          import.meta.url
        ),
        "utf8"
      )
    );
    await assert.rejects(
      pg.exec(
        `UPDATE "Product" SET "anchorConfirmedAt" = CURRENT_TIMESTAMP, "anchorPriceCents" = 100, "anchorDate" = '2026-09-10' WHERE id = 'simple'`
      ),
      /check constraint/
    );
    const common = {
      itemKey: "p:simple",
      anchorPriceCents: 10000,
      anchorDate: "2026-09-10",
      anchorRegime: "GENERAL_2026" as const,
      barcode: "123",
      barcodeNotApplicable: false,
      unitMeasure: null,
      unitQuantity: null,
      unitNotApplicable: true,
      brandNotApplicable: false,
      saleLabel: null,
      stock: 3,
      stockStatus: "INSTOCK" as const,
    };
    const rows = [
      common,
      { ...common, itemKey: "v:v1", anchorPriceCents: 2500 },
      {
        ...common,
        itemKey: "v:v2",
        anchorPriceCents: 3000,
        unitMeasure: "kg",
        unitQuantity: 0.5,
        unitNotApplicable: false,
      },
    ];
    const adapterFor = (client: Pick<PGlite, "query">) =>
      ({
        $executeRaw: async (
          strings: TemplateStringsArray,
          ...values: unknown[]
        ) => {
          const query = strings.reduce(
            (text, part, index) => text + (index ? `$${index}` : "") + part,
            ""
          );
          return (await client.query(query, values)).affectedRows ?? 0;
        },
      }) as Pick<Prisma.TransactionClient, "$executeRaw">;
    const adapter = adapterFor(pg);
    await pg.transaction(async (tx) => {
      await applyConfirmation(adapterFor(tx), rows);
    });
    const simple = (
      await pg.query<{ anchorPriceCents: number; stock: number }>(
        'SELECT "anchorPriceCents", stock FROM "Product" WHERE id = $1',
        ["simple"]
      )
    ).rows[0];
    assert.deepEqual(simple, { anchorPriceCents: 10000, stock: 3 });
    assert.deepEqual(
      (
        await pg.query(
          'SELECT "anchorPriceCents", "unitNotApplicable" FROM "Product" WHERE id = $1',
          ["variable"]
        )
      ).rows[0],
      { anchorPriceCents: null, unitNotApplicable: false }
    );
    assert.equal(
      (
        await pg.query<{ unitQuantity: number }>(
          'SELECT "unitQuantity" FROM "ProductVariant" WHERE id = $1',
          ["v2"]
        )
      ).rows[0].unitQuantity,
      0.5
    );
    const before = (
      await pg.query(
        'SELECT "anchorConfirmedAt" FROM "Product" WHERE id = $1',
        ["simple"]
      )
    ).rows[0];
    await applyConfirmation(adapter, rows);
    assert.deepEqual(
      (
        await pg.query(
          'SELECT "anchorConfirmedAt" FROM "Product" WHERE id = $1',
          ["simple"]
        )
      ).rows[0],
      before
    );
    await pg.exec("UPDATE \"Product\" SET price = 90 WHERE id = 'simple'");
    await assert.rejects(
      pg.exec(
        'UPDATE "Product" SET "anchorPriceCents" = 9000 WHERE id = \'simple\''
      ),
      /separately reviewed/
    );
    await assert.rejects(
      pg.exec(
        "UPDATE \"ProductVariant\" SET \"anchorDate\" = '2026-09-11' WHERE id = 'v1'"
      ),
      /separately reviewed/
    );
    await pg.exec(`INSERT INTO "PriceAnchorAudit" (id, "itemKey", before, after, reason, actor) VALUES ('audit', 'p:simple', '{}', '{}', 'Owner confirmation', 'admin');
      INSERT INTO "PriceListSnapshot" (id, filename, "localDate", content, checksum, "rowCount") VALUES ('snapshot', 'webshop.csv', '2026-10-01', 'csv', 'hash', 3);`);
    await assert.rejects(
      pg.exec('DELETE FROM "PriceAnchorAudit"'),
      /append-only/
    );
    await assert.rejects(
      pg.exec("UPDATE \"PriceListSnapshot\" SET content = 'changed'"),
      /append-only/
    );
    await assert.rejects(
      pg.exec('DELETE FROM "PriceListSnapshot"'),
      /append-only/
    );
    await assert.rejects(
      pg.exec(
        `INSERT INTO "PriceListSnapshot" (id, filename, "localDate", content, checksum, "rowCount") VALUES ('other', 'another.csv', '2026-10-01', 'csv', 'hash', 3)`
      ),
      /unique constraint/
    );
    const lock = await pg.query(
      "SELECT 1 AS locked FROM pg_advisory_xact_lock(7462017)"
    );
    assert.equal(lock.rows.length, 1);
  } finally {
    await pg.close();
  }
});
