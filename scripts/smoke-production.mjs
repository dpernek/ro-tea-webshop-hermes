#!/usr/bin/env node
/**
 * RO-TEA Production Smoke Test
 * Usage: node scripts/smoke-production.mjs [base-url]
 * Default: https://ro-tea-webshop-hermes.vercel.app
 */

const BASE = process.argv[2] || "https://ro-tea-webshop-hermes.vercel.app";
const FAIL = "\x1b[31mFAIL\x1b[0m";
const PASS = "\x1b[32mPASS\x1b[0m";

const ROUTES = [
  { path: "/", label: "Homepage", checkBody: true },
  { path: "/proizvodi", label: "Katalog", checkBody: true },
  { path: "/proizvodi/adapter-festa-industry-1-2-1-4-hex-crmo", label: "Product detail 1", checkBody: true },
  { path: "/proizvodi/brusna-ploca-za-kutnu-brusilicu", label: "Product detail 2", checkBody: true },
  { path: "/proizvodi/tanjurasta-cetka", label: "Product detail 3", checkBody: true },
  { path: "/kategorije/turpije", label: "Category 1", checkBody: true },
  { path: "/kategorije/roto-glodala", label: "Category 2", checkBody: true },
  { path: "/katalozi", label: "Katalozi", checkBody: true },
  { path: "/api/catalog/categories", label: "API categories", checkBody: true, checkJson: true },
  { path: "/api/catalog/brands", label: "API brands", checkBody: true, checkJson: true },
  { path: "/api/catalog/products", label: "API products", checkBody: true, checkJson: true },
  { path: "/sitemap.xml", label: "Sitemap", checkBody: true, checkXml: true },
];

const ERROR_SHELLS = [
  "This page couldn't load",
  "Application error",
  "A server error occurred",
  "DIGEST",
];

let passed = 0;
let failed = 0;

for (const route of ROUTES) {
  const url = BASE + route.path;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const body = await res.text();
    const status = res.status;
    const hasBody = body.trim().length > 0;
    const hasErrorShell = ERROR_SHELLS.some(s => body.includes(s));

    let ok = status === 200;
    if (route.checkBody && !hasBody) ok = false;
    if (route.checkJson) {
      try { JSON.parse(body); } catch { ok = false; }
    }
    if (route.checkXml) {
      if (!body.includes("<urlset") && !body.trim().startsWith("<?xml")) ok = false;
    }
    if (hasErrorShell) ok = false;

    const issues = [];
    if (status !== 200) issues.push(`status=${status}`);
    if (!hasBody) issues.push("empty body");
    if (hasErrorShell) issues.push("error shell");
    if (issues.length === 0) issues.push("ok");

    if (ok) { passed++; console.log(`${PASS} ${route.label} (${url})`); }
    else { failed++; console.log(`${FAIL} ${route.label} (${url}) — ${issues.join(", ")}`); }

  } catch (e) {
    failed++;
    console.log(`${FAIL} ${route.label} (${url}) — ${e.message}`);
  }
}

console.log(`\nPassed: ${passed}/${ROUTES.length}  Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
