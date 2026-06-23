# CHANGELOG — RO-TEA Webshop

## fix/ecommerce-production-hardening (2026-06-23)

### Faza 0: Baseline Audit
- `f230056` — AUDIT_BASELINE.md: strukturirani audit s P0 rizicima

### Faza 1: Stripe, Checkout, Order Lifecycle
- `a727e0e` — StripeEvent tablica za DB-level webhook idempotenciju
- `stockAdjustedAt` na OrderItem sprječava duplo smanjenje zaliha
- Unified pricing lib (`src/lib/pricing.ts`) — `computePrices()`
- Webhook rewritten s `StripeEvent` tablicom i stockAdjustedAt trackingom
- Checkout session koristi `computePrices()` umjesto duplicirane logike

### Faza 2: Admin Orders i Dashboard
- `d953ba4` — `OrderAudit` model za praćenje promjena statusa
- Audit logging u order PATCH ruti
- Dashboard: `noStore()` + Prisma query za konzistentan count
- Viewed status samo na order detalju (ne na listi)
- Order detail: Stripe info, timeline, sync gumb (već postoji)

### Faza 3: Admin Products, Brands, Catalogs, Upload
- `59f8ce3` — Product PATCH: striktni whitelist (samo poslana polja)
- Validacija: salePrice < regularPrice
- DELETE: soft delete (ARCHIVED) s provjerom povezanih narudžbi
- Upload apstrakcija (`src/lib/upload.ts`): local, supabase-storage, cloudinary

### Faza 4: Frontend UX i Webshop Polish
- `ecdfd30` — ProductCard: sale price zeleno, old strikethrough, aria-label
- Catalog: mobile filter drawer, active filter chips, search debounce 300ms
- Cart: dinamički hint "Još X € za besplatnu dostavu"
- Checkout: popravljen email regex, loading stateovi
- Homepage: brand credibility strip + B2B CTA
- Loading skeleton za `/proizvodi`

### Faza 5: SEO, Security, Performance
- Sitemap uključuje sve ACTIVE proizvode i kategorije
- Canonical URL-ovi na katalogu i produktima
- Open Graph meta tagovi na svim server-rendered stranicama
- Upload MIME validacija (ext + content type)
- CHANGELOG.md i ažuriran README

---

## Migracije

Nakon deploya pokrenuti:
```
POST /api/admin/migrate-phase1   # StripeEvent tablica, stockAdjustedAt
POST /api/admin/migrate-stripe   # ALTER kolone za Stripe (Order)
POST /api/admin/migrate-viewed   # viewed kolona
```

Rollback: `DROP TABLE IF EXISTS "StripeEvent", "OrderAudit"; ALTER TABLE "OrderItem" DROP COLUMN "stockAdjustedAt";`
