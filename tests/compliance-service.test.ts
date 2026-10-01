import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  confirmAnchors,
  publishPriceList,
  ComplianceError,
  previewPriceList,
} from "../src/lib/compliance/service";
import {
  catalogFingerprint,
  reviewTemplate,
  zagrebDate,
} from "../src/lib/compliance/catalog";
import { GET as cron } from "../src/app/api/cron/cjenici/route";
import { GET as manifest } from "../src/app/cjenici/manifest.json/route";
import { GET as download } from "../src/app/cjenici/datoteke/[filename]/route";
import { AnchorPrice } from "../src/components/products/AnchorPrice";
import { sampleProduct } from "./compliance-fixture";

const globalDb = globalThis as unknown as { prisma?: unknown };

test("CSV preview reads the saved catalog without publishing, even when daily publishing is disabled", async () => {
  globalDb.prisma = { product: { findMany: async () => [sampleProduct()] } };
  try {
    const result = await previewPriceList(new Date("2026-10-01T05:30:00Z"));
    assert.equal(result.rowCount, 1);
    assert.equal(result.filename, "pregled_webshop_2026-10-01_07-30-00.csv");
    assert.ok(result.content.includes('"sidrena_cijena"'));
    globalDb.prisma = {
      product: { findMany: async () => [sampleProduct({ barcode: null })] },
    };
    await assert.rejects(previewPriceList(), ComplianceError);
  } finally {
    delete globalDb.prisma;
  }
});

test("public manifest distinguishes today's file from an old archive and returns 503 when storage fails", async () => {
  const today = zagrebDate(new Date());
  const snapshot = {
    filename: "webshop.csv",
    localDate: today,
    checksum: "hash",
    rowCount: 1,
    publishedAt: new Date(),
  };
  let archive = [{ ...snapshot, localDate: "2020-01-01" }];
  globalDb.prisma = { priceListSnapshot: { findMany: async () => archive } };
  try {
    const stale = await manifest();
    assert.equal(stale.status, 200);
    assert.equal(stale.headers.get("cache-control"), "no-store");
    const data = await stale.json();
    assert.equal(data.current, null);
    assert.equal(data.archive[0].href, "/cjenici/datoteke/webshop.csv");
    archive = [snapshot, ...archive];
    assert.equal((await (await manifest()).json()).current.localDate, today);
    globalDb.prisma = {
      priceListSnapshot: {
        findMany: async () => {
          throw new Error("private DB connection string");
        },
      },
    };
    const failed = await manifest();
    assert.equal(failed.status, 503);
    assert.ok(!(await failed.text()).includes("private"));
  } finally {
    delete globalDb.prisma;
  }
});

test("review preview writes nothing and a stale catalog rejects confirmation", async () => {
  const products = [sampleProduct({ anchorConfirmedAt: null })];
  const input = {
    fingerprint: catalogFingerprint(products),
    source: "Izjava vlasnika o nepromijenjenim redovnim cijenama",
    acknowledgeReferenceDates: true,
    acknowledgeUnchangedPrices: true,
    rows: reviewTemplate(products).rows,
  };
  let writes = 0;
  const tx = {
    product: { findMany: async () => products },
    $executeRaw: async () => {
      writes++;
    },
    priceAnchorAudit: {
      createMany: async () => {
        writes++;
      },
    },
  };
  globalDb.prisma = {
    $transaction: async (fn: (client: typeof tx) => unknown) => fn(tx),
  };
  try {
    assert.deepEqual(await confirmAnchors(input, "admin@example.test", true), {
      preview: true,
      rowCount: 1,
      newAnchors: 1,
    });
    assert.equal(writes, 0);
    products[0].price = 99;
    await assert.rejects(
      confirmAnchors(input, "admin@example.test", false),
      (error: unknown) =>
        error instanceof ComplianceError && error.status === 409
    );
    assert.equal(writes, 0);
  } finally {
    delete globalDb.prisma;
  }
});

test("daily publication is idempotent and failed validation writes no snapshot", async () => {
  let products = [sampleProduct()];
  let snapshot: { filename: string; checksum: string; content: string } | null =
    null;
  let sequence = 0;
  let enabled = false;
  const runs: string[] = [];
  const tx = {
    $queryRaw: async () => [{ locked: 1 }],
    product: { findMany: async () => products },
    priceListSettings: {
      findUnique: async () => ({
        address: "ro-tea.hr",
        objectCode: "WEB-01",
        sequence,
        enabled,
      }),
      update: async ({ data }: { data: { sequence: number } }) => {
        sequence = data.sequence;
      },
    },
    priceListSnapshot: {
      findUnique: async () => snapshot,
      create: async ({ data }: { data: NonNullable<typeof snapshot> }) => {
        snapshot = data;
      },
    },
    priceListRun: {
      create: async ({ data }: { data: { status: string } }) => {
        runs.push(data.status);
      },
    },
  };
  globalDb.prisma = {
    $transaction: async (fn: (client: typeof tx) => unknown) => fn(tx),
    priceListRun: tx.priceListRun,
  };
  try {
    const now = new Date("2026-10-01T04:00:00Z");
    assert.equal((await publishPriceList(now)).status, "DISABLED");
    assert.equal(snapshot, null);
    enabled = true;
    products = [sampleProduct({ anchorConfirmedAt: null })];
    await assert.rejects(publishPriceList(now), ComplianceError);
    assert.equal(snapshot, null);
    assert.equal(sequence, 0);
    assert.deepEqual(runs, ["FAILED"]);
    products = [sampleProduct()];
    const published = await publishPriceList(now);
    assert.equal(published.status, "PUBLISHED");
    assert.match(
      published.filename!,
      /^webshop_ro-tea.hr_WEB-01_1_2026-10-01_06-00-00\.csv$/
    );
    assert.equal(sequence, 1);
    const saved = snapshot as unknown as { checksum: string; content: string };
    assert.equal(
      saved.checksum,
      createHash("sha256").update(saved.content).digest("hex")
    );
    assert.deepEqual(await publishPriceList(now), {
      status: "EXISTING",
      filename: published.filename,
    });
    assert.equal(sequence, 1);
    assert.deepEqual(runs, ["FAILED", "PUBLISHED"]);
  } finally {
    delete globalDb.prisma;
  }
});

test("cron rejects missing or incorrect secrets before touching the database", async () => {
  const previous = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal(
      (await cron(new Request("http://localhost/api/cron/cjenici"))).status,
      401
    );
    process.env.CRON_SECRET = "test-secret-only";
    assert.equal(
      (
        await cron(
          new Request("http://localhost/api/cron/cjenici", {
            headers: { authorization: "Bearer wrong" },
          })
        )
      ).status,
      401
    );
    globalDb.prisma = {
      $transaction: async (fn: (client: unknown) => unknown) =>
        fn({
          $queryRaw: async () => [],
          priceListSettings: { findUnique: async () => null },
        }),
    };
    const response = await cron(
      new Request("http://localhost/api/cron/cjenici", {
        headers: { authorization: "Bearer test-secret-only" },
      })
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "DISABLED");
  } finally {
    delete globalDb.prisma;
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  }
});

test("public CSV downloads need no login, preserve bytes and support immutable caching", async () => {
  let reads = 0;
  globalDb.prisma = {
    priceListSnapshot: {
      findUnique: async ({ where }: { where: { filename: string } }) => {
        reads++;
        return where.filename === "webshop.csv"
          ? { content: "\uFEFFCSV\r\n", checksum: "abc" }
          : null;
      },
    },
  };
  try {
    const context = (filename: string) => ({
      params: Promise.resolve({ filename }),
    });
    assert.equal(
      (
        await download(
          new Request("http://localhost"),
          context("../private.csv")
        )
      ).status,
      404
    );
    assert.equal(reads, 0);
    const response = await download(
      new Request("http://localhost"),
      context("webshop.csv")
    );
    assert.equal(response.status, 200);
    assert.deepEqual(
      Buffer.from(await response.arrayBuffer()),
      Buffer.from("\uFEFFCSV\r\n")
    );
    assert.equal(
      response.headers.get("content-type"),
      "text/csv; charset=utf-8"
    );
    assert.match(response.headers.get("cache-control")!, /immutable/);
    const cached = await download(
      new Request("http://localhost", {
        headers: { "if-none-match": '"abc"' },
      }),
      context("webshop.csv")
    );
    assert.equal(cached.status, 304);
    assert.equal(
      (await download(new Request("http://localhost"), context("missing.csv")))
        .status,
      404
    );
  } finally {
    delete globalDb.prisma;
  }
});

test("historical price stays visible when equal and unconfirmed prices stay hidden", () => {
  const html = renderToStaticMarkup(
    createElement(AnchorPrice, { cents: 10000, date: "2026-09-10" })
  );
  assert.match(html, /Cijena na 10\. 9\. 2026\./);
  assert.match(html, /100,00/);
  assert.equal(
    renderToStaticMarkup(
      createElement(AnchorPrice, { cents: null, date: null })
    ),
    ""
  );
});
