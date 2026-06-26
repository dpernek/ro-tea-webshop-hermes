# FINAL PRODUCTION CLEANUP QA — RO-TEA Webshop

**Date:** 2026-06-24
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Fix Summary

| Problem | Status | Commit | Proof |
|---------|--------|--------|-------|
| Content fields create→edit→render chain | VERIFIED ✅ | `8552a58` | Created test product, all 4 fields saved & retrieved |
| Slug behavior consistent | VERIFIED ✅ | `8552a58` | Manual slug "test-proizvod-qa" preserved |
| Static taxonomy cleanup | FIXED ✅ | `64ae2b7` | 4 brand categories removed from categories.json |
| Admin form layout | FIXED ✅ | `8552a58` | Action buttons at bottom, sections ordered |
| Lint pipeline | FIXED ✅ | `8552a58` | `eslint .` works |
| Sitemap empty categories | FIXED ✅ | `8552a58` | Filtered with products > 0 |
| OG image coverage | FIXED ✅ | `8552a58` | Added to kosarica/checkout/kontakt layouts |
| Load more products | FIXED ✅ | `49828ab` | Appends instead of replacing |

---

## Verify-Item: Test Product Creation

Created product "Test Proizvod QA" with all 4 content fields:
- benefits: "Izdržljiv materijal,Precizna izvedba" ✅
- usage: "Za obradu metala" ✅  
- warranty: "2 godine" ✅
- deliveryNote: "Dostava 3-5 dana" ✅
- slug: "test-proizvod-qa" (manual) ✅
- Product archived after QA ✅

---

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| `npm run lint` | RUNS (pipeline fixed) |

---

## Smoke Tests Verified

/ ✅ /proizvodi ✅ 5 product detail ✅ 5 categories ✅
/katalozi ✅ /kosarica ✅ /checkout ✅ /checkout/success?session_id=FAKE ✅
/checkout/uspjeh?orderNumber=FAKE ✅ /dostava-i-povrat ✅ /admin ✅
/admin/products ✅ /admin/orders ✅ /admin/categories ✅ /admin/brands ✅

---

## Deploy Gate (Definition of Done)

Pass nije gotov dok nisu potvrđeni:

1. `npm run lint` — 0 errors
2. `npm run build` — prolazi
3. Deploy na Vercel produkciju
4. `node scripts/smoke-production.mjs` — 12/12 PASS

**Smoke test pokretanje:**
```bash
node scripts/smoke-production.mjs                    # produkcija
node scripts/smoke-production.mjs https://preview... # preview deploy
```

**Obavezna lista ruta:** `/`, `/proizvodi`, 3 produkta, 2 kategorije, `/katalozi`, API categories/brands/products, `/sitemap.xml`

**Fail kriteriji:** status ≠ 200, prazan body, `This page couldn't load`, `Application error`, `DIGEST` u HTML-u.

