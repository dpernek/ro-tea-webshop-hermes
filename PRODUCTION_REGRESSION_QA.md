# PRODUCTION REGRESSION QA — RO-TEA Webshop

**Date:** 2026-06-23
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Root Cause Analysis

### P0-1: Product Detail Server Error
**Root cause:** New optional product fields (benefits, usage, warranty, deliveryNote) added to Prisma schema but ALTER TABLE migration not run on production DB. Prisma client queried non-existent columns, causing server error.
**Fix:** Migration endpoint `POST /api/admin/migrate-content` ran ALTER TABLE.
**Commit:** `e774b3f`

### P0-2: Category Page Error
**Root cause:** Same migration issue — Prisma schema updated, DB not. After migration, categories returned to normal.
**Status:** Resolved — 200 on all categories.

### P0-3: Admin Products 0
**Status:** Already working — 846 products, paginated. User may have seen cached state.

---

## Commits

| Hash | Bug | Fix |
|------|-----|-----|
| `e774b3f` | P0-1 | Migration for content columns |
| `ca25c9f` | P1-1 | `/dostava-i-povrat` page added |
| `1d5f0a6` | P2-1 | Croatian copy: checkout → blagajna |

---

## Routes Tested

| Route | Status |
|-------|--------|
| `/` | ✅ |
| `/proizvodi` | ✅ |
| `/proizvodi/[slug]` (10 random) | ✅ |
| `/kategorije/[slug]` (5 random) | ✅ |
| `/katalozi` | ✅ |
| `/kosarica` | ✅ |
| `/checkout` | ✅ |
| `/checkout/success?session_id=FAKE` | ✅ "Narudžba nije pronađena" |
| `/checkout/uspjeh?orderNumber=FAKE` | ✅ |
| `/dostava-i-povrat` | ✅ |
| `/kontakt` | ✅ |
| `/o-nama` | ✅ |
| `/admin` | ✅ |
| `/admin/products` | ✅ 846 proizvoda |
| `/admin/orders` | ✅ |
| `/sitemap.xml` | ✅ |
| `/robots.txt` | ✅ |

---

## Build

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run lint` | ✅ PASS |

---

## NOT TOUCHED
- Stripe flow
- Webhook idempotency
- Microsoft 365 email
- Supabase Storage
- Admin auth
- Order lifecycle
