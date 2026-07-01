#!/usr/bin/env node
/**
 * RO-TEA Production Smoke Test (enhanced)
 * Usage: node scripts/smoke-production.mjs [base-url]
 * Default: https://ro-tea-webshop-hermes.vercel.app
 */

const BASE = process.argv[2] || "https://ro-tea-webshop-hermes.vercel.app";
const R = "\x1b[31mFAIL\x1b[0m";
const G = "\x1b[32mPASS\x1b[0m";

const ERROR_SHELLS = ["This page couldn't load", "Application error", "A server error occurred", "DIGEST"];

async function fetchJson(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  const text = await res.text();
  if (!text.trim()) throw new Error(`${path} → empty body`);
  return JSON.parse(text);
}

// --- Fetch real slugs from API ---
console.log("Fetching live data for slugs...");
let productSlugs = [];
let categorySlugs = [];
try {
  const productsData = await fetchJson("/api/catalog/products");
  productSlugs = (productsData.products || []).slice(0, 3).map(p => p.slug).filter(Boolean);
  console.log(`  Products: ${productSlugs.length} slugs`);
} catch (e) {
  console.error(`${R} Cannot fetch products API: ${e.message}`);
  process.exit(1);
}
try {
  const categoriesData = await fetchJson("/api/catalog/categories");
  categorySlugs = (Array.isArray(categoriesData) ? categoriesData : []).slice(0, 2).map(c => c.slug).filter(Boolean);
  console.log(`  Categories: ${categorySlugs.length} slugs`);
} catch (e) {
  console.error(`${R} Cannot fetch categories API: ${e.message}`);
  process.exit(1);
}

if (productSlugs.length < 1 || categorySlugs.length < 1) {
  console.error(`${R} Not enough slugs from API (products: ${productSlugs.length}, categories: ${categorySlugs.length})`);
  process.exit(1);
}

// --- Build route list ---
const ROUTES = [
  { label: "Homepage", path: "/" },
  { label: "Katalog", path: "/proizvodi" },
  ...productSlugs.map((slug, i) => ({ label: `Product ${i + 1}`, path: `/proizvodi/${slug}` })),
  ...categorySlugs.map((slug, i) => ({ label: `Category ${i + 1}`, path: `/kategorije/${slug}` })),
  { label: "Cart", path: "/kosarica" },
  { label: "Checkout", path: "/checkout" },
  { label: "Admin login", path: "/admin/login" },
  { label: "Katalozi", path: "/katalozi" },
  { label: "Kontakt", path: "/kontakt" },
  { label: "Uvjeti kupnje", path: "/uvjeti-kupnje" },
  { label: "Privatnost", path: "/pravila-o-privatnosti" },
  { label: "Dostava", path: "/pravila-dostave" },
  { label: "API categories", path: "/api/catalog/categories", json: true },
  { label: "API brands", path: "/api/catalog/brands", json: true },
  { label: "API products", path: "/api/catalog/products", json: true },
  { label: "API shipping", path: "/api/shipping", json: true },
  { label: "API coupon", path: "/api/coupons/validate", json: true, post: true, postBody: { code: "SMOKE_TEST", subtotal: 0 }, allow404: true },
  { label: "Sitemap", path: "/sitemap.xml", xml: true },
];

// --- QA content guard ---
const QA_PATTERNS = ["QA-CMS", "QA-CTA", "Changed via QA", "QA Kategorije", "[CLAIM:QA]"];

// --- Run tests ---
let passed = 0;
let failed = 0;

for (const route of ROUTES) {
  const url = BASE + route.path;
  try {
    const opts = {};
    if (route.post) {
      opts.method = "POST";
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(route.postBody);
    }
    const res = await fetch(url, { redirect: "follow", ...opts });
    const body = await res.text();
    const status = res.status;
    const hasBody = body.trim().length > 0;
    const hasShell = ERROR_SHELLS.some(s => body.includes(s));
    let ok = (status === 200 || (route.allow404 && status === 404)) && hasBody && !hasShell;

    if (route.json) { try { JSON.parse(body); } catch { ok = false; } }
    if (route.xml) { if (!body.includes("<urlset") && !body.trim().startsWith("<?xml")) ok = false; }

    // QA content guard — only for homepage
    if (route.path === "/" && ok) {
      for (const qa of QA_PATTERNS) {
        if (body.includes(qa)) {
          console.log(`\x1b[33mWARN\x1b[0m | ${route.label.padEnd(18)} | Found QA content: "${qa}"`);
          // Don't fail, just warn
        }
      }
    }

    const parts = [];
    parts.push(ok ? G : R);
    parts.push(route.label.padEnd(18));
    parts.push(String(status).padEnd(5));
    parts.push(`body=${hasBody ? "✓" : "✗"}`.padEnd(9));
    parts.push(`err=${hasShell ? "✓" : "✗"}`.padEnd(8));
    parts.push(url);

    if (ok) passed++; else failed++;
    console.log(parts.join(" | "));

  } catch (e) {
    failed++;
    console.log(`${R} | ${route.label.padEnd(18)} | ERR  | body=✗ | err=✗ | ${url} — ${e.message}`);
  }
}

console.log(`\nPassed: ${passed}/${ROUTES.length}  Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
