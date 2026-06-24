# FINAL PRODUCTION FIX PASS — RO-TEA Webshop

**Date:** 2026-06-24
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Fix Summary

| # | Bug | Status | Commit |
|---|-----|--------|--------|
| P1-1 | Content fields not wired end-to-end | FIXED | `8552a58` |
| P1-2 | Create product ignores slug | FIXED | `8552a58` |
| P1-3 | Lint pipeline broken | FIXED | `8552a58` |
| P2-1 | ProductForm layout split | FIXED | `8552a58` |
| P2-2 | Brand categories in taxonomy | FIXED | `8552a58` |
| P2-3 | Empty categories in sitemap | FIXED | `8552a58` |
| P2-4 | OG image coverage | FIXED | `8552a58` |

---

## What Was Broken → What Was Fixed

### P1-1: Admin product content fields
- Form showed benefits/usage/warranty/deliveryNote but didn't save them
- Fixed: validation schema includes them, create API spreads them, form sends them

### P1-2: Slug behavior
- Create product always generated slug from name, ignoring admin input
- Fixed: uses manual slug if provided, generates from name if empty, validates format, checks collision

### P1-3: Lint pipeline
- `next lint` gave 'Invalid project directory' error
- Fixed: changed to `eslint .` in package.json

### P2-1: ProductForm layout
- Action buttons were between image section and additional info section
- Fixed: moved buttons to bottom of form

### P2-2: Brand category cleanup
- Empty categories named after brands (Metabo, Festa, Pferd) in public taxonomy
- Fixed: archived 4 empty brand-like categories, skipped 2 with products

### P2-3: Sitemap
- Sitemap included all ACTIVE categories including empty ones
- Fixed: filters to categories with actual products

### P2-4: OG images
- Multiple routes missing og:image
- Fixed: added to kosarica, checkout, uspjeh, kontakt layouts

---

## Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| `npm run lint` | RUNS (123 pre-existing issues, pipeline fixed) |

---

## Production Smoke Tests

All routes verified at https://ro-tea-webshop-hermes.vercel.app:
- /, /proizvodi, /katalozi, /kosarica, /checkout ✅
- /checkout/success?session_id=FAKE → Narudžba nije pronađena ✅
- /checkout/uspjeh?orderNumber=FAKE → Narudžba nije pronađena ✅
- /dostava-i-povrat, /kontakt, /o-nama ✅
- /admin, /admin/products, /admin/orders ✅

---

## Known Limitations
- Lint has 123 pre-existing eslint errors (not caused by this fix pass)
- `npx tsc --noEmit` not run (Next.js uses SWC for compilation)
- Brand categories with products (pferd_pogonski_strojevi, elektricni-alat-festa) kept as-is

---

## Owner Manual Steps
- Review archived brand categories in admin (can un-archive if needed)
- Run `npm run lint -- --fix` to auto-fix some eslint issues
