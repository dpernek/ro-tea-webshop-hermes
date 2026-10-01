import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { publishAndVerify, localDate } from "../scripts/publish-price-list.mjs";
import { buildPriceList } from "../src/lib/compliance/catalog";
import { sampleProduct } from "./compliance-fixture";

const origin = "https://shop.example";
const csv = buildPriceList([sampleProduct()]).content;
const checksum = createHash("sha256").update(csv).digest("hex");
const filename = "webshop_shop.example_WEB-01_1_2026-10-01_07-30-00.csv";
const time = new Date("2026-10-01T05:30:00Z");
const current = {
  filename,
  localDate: "2026-10-01",
  checksum,
  rowCount: 1,
  publishedAt: time.toISOString(),
};
type Options = {
  status?: string;
  current?: typeof current | null;
  content?: string;
  firstFailure?: boolean;
};

function mockPublisher(options: Options = {}) {
  const calls: Array<{ url: string; options?: RequestInit }> = [];
  const request: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, options: init });
    if (url.endsWith("/api/cron/cjenici")) {
      if (options.firstFailure && calls.length === 1)
        return new Response(null, { status: 503 });
      return Response.json({ status: options.status ?? "PUBLISHED", filename });
    }
    if (url.endsWith("/manifest.json"))
      return Response.json({
        current: options.current === undefined ? current : options.current,
      });
    assert.equal(url, `${origin}/cjenici/datoteke/${filename}`);
    return new Response(options.content ?? csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  };
  return { request, calls };
}
const config = {
  origin,
  secret: "not-a-real-secret",
  now: () => time,
  sleep: async () => {},
  attempts: 1,
};

test("morning publisher verifies today's public CSV bytes and sends credentials only to the cron endpoint", async () => {
  const mock = mockPublisher();
  const result = await publishAndVerify({ ...config, request: mock.request });
  assert.equal(result.checksum, checksum);
  assert.equal(result.localDate, "2026-10-01");
  assert.equal(mock.calls.length, 3);
  assert.deepEqual(mock.calls[0].options?.headers, {
    authorization: "Bearer not-a-real-secret",
  });
  for (const call of mock.calls.slice(1)) {
    assert.equal(call.options?.headers, undefined);
    assert.equal(call.options?.redirect, "error");
  }
});

test("07:30 remains local time during winter, summer and both daylight-saving transitions", async () => {
  for (const [utc, day] of [
    ["2026-03-28T06:30:00Z", "2026-03-28"],
    ["2026-03-29T05:30:00Z", "2026-03-29"],
    ["2026-10-24T05:30:00Z", "2026-10-24"],
    ["2026-10-25T06:30:00Z", "2026-10-25"],
  ]) {
    const instant = new Date(utc);
    const mock = mockPublisher({
      current: { ...current, localDate: day, publishedAt: utc },
    });
    assert.equal(localDate(instant), day);
    assert.equal(
      (
        await publishAndVerify({
          ...config,
          now: () => instant,
          request: mock.request,
        })
      ).localDate,
      day
    );
  }
});

test("HTTP 200 with a disabled publisher, stale archive or corrupted CSV fails verification", async () => {
  for (const options of [
    { status: "DISABLED" },
    { current: null },
    { current: { ...current, localDate: "2026-09-30" } },
    { content: "an HTML login page" },
  ]) {
    await assert.rejects(
      publishAndVerify({ ...config, request: mockPublisher(options).request })
    );
  }
});

test("retry after a temporary failure verifies the existing file without replacing it", async () => {
  const mock = mockPublisher({ firstFailure: true, status: "EXISTING" });
  const waits: number[] = [];
  const result = await publishAndVerify({
    ...config,
    request: mock.request,
    attempts: 3,
    sleep: async (ms: number) => {
      waits.push(ms);
    },
  });
  assert.equal(result.status, "EXISTING");
  assert.deepEqual(waits, [10000]);
  assert.equal(mock.calls.length, 4);
});

test("scheduled verification flags a missed 08:00 deadline but allows manual acceptance later", async () => {
  const late = "2026-10-01T06:00:00Z";
  const options = { current: { ...current, publishedAt: late } };
  await assert.rejects(
    publishAndVerify({ ...config, request: mockPublisher(options).request }),
    /nakon roka/
  );
  await publishAndVerify({
    ...config,
    request: mockPublisher(options).request,
    enforceDeadline: false,
  });
});

test("missing credentials cause no request; untrusted network errors never expose their content", async () => {
  const mock = mockPublisher();
  await assert.rejects(
    publishAndVerify({ ...config, secret: "", request: mock.request }),
    /CRON_SECRET/
  );
  assert.equal(mock.calls.length, 0);
  await assert.rejects(
    publishAndVerify({
      ...config,
      request: async () => {
        throw new Error(config.secret);
      },
    }),
    (error: unknown) =>
      error instanceof Error && !error.message.includes(config.secret)
  );
});
