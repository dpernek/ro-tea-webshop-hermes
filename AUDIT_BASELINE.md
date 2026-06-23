# AUDIT BASELINE — RO-TEA Webshop

**Datum:** 2026-06-23
**Branch:** `fix/ecommerce-production-hardening`
**Commit:** `8560026` (latest main)
**Stack:** Next.js 16, React 19, TypeScript, Prisma 7 (proxy), Supabase PostgreSQL, Stripe, Tailwind 4
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## 1. Build & Lint

| Check | Result |
|-------|--------|
| `npm install` | ✅ Pass |
| `npm run lint` | ✅ Pass (non-blocking dir warning) |
| `npm run build` | ✅ Pass |

---

## 2. Što radi

| Feature | Status |
|---------|--------|
| Javni webshop — homepage, katalog, produkti, kategorije | ✅ |
| Katalog: search, filteri, sort, paginacija 24+24 | ✅ |
| Cookie banner (samo donji, bez overlay-a) | ✅ |
| Admin login (DB auth, role ADMIN) | ✅ |
| Admin layout (odvojen od javnog) | ✅ |
| Admin CRUD: proizvodi, kategorije, brendovi, dostava, kuponi | ✅ |
| Admin upload slika (public/images) | ✅ |
| Stripe Checkout Session kreiranje | ✅ |
| Stripe webhook (raw body, sig validacija) | ✅ |
| Bankovna uplata / pouzeće flow | ✅ |
| Success stranica `/checkout/uspjeh` | ✅ |
| Checkout sažetak (CartSummary) | ✅ |
| ProductCard s AKCIJA badgeom | ✅ |
| Specifikacije (samo za 32 proizvoda iz XML-a) | ✅ |
| EAN polje u adminu i na produkt detailu | ✅ |
| Sitemap, robots.txt | ✅ |
| JSON-LD structured data | ✅ |

---

## 3. P0 Rizici — Kritični problemi

### 3.1 Dashboard broj narudžbi netočan
**Lokacija:** `src/app/admin/page.tsx`
**Opis:** Prisma proxy vraća cacheani count (pokazuje 20, stvarno je 2).
**Trenutni workaround:** `noStore()` + raw SQL `$queryRawUnsafe` — nije pouzdano.
**Fix:** Zamijeniti Prisma count konzistentnim DB queryjem bez proxy cachea.

### 3.2 Webhook idempotencija
**Lokacija:** `src/app/api/stripe/webhook/route.ts`
**Opis:** Koristi in-memory Set — ne preživljava restart/deploy.
**Fix:** Dodati `StripeEvent` tablicu s unique `eventId`.

### 3.3 Stock / order konzistencija
**Opis:** Stock se smanjuje u webhook handleru, ali nema zaštite od duplog smanjenja. Nema `stockAdjustedAt` polja.
**Fix:** Ddati stock adjustment tracking.

### 3.4 Product edit PATCH može resetirati polja
**Lokacija:** `src/app/api/admin/products/[id]/route.ts`
**Opis:** Partial PATCH koristi `productSchema.partial()` ali nije garantirano da ne resetira nepovezana polja.
**Fix:** Eksplicitno whitelist-ati polja koja su poslana.

### 3.5 Cleanup endpoint
**Lokacija:** `src/app/api/admin/cleanup-test-orders/route.ts`
**Opis:** Postoji produkcijski endpoint koji može obrisati SVE narudžbe.
**Fix:** Ukloniti ili zaštititi dodatnom provjerom.

---

## 4. Relevantne rute i datoteke

### Stripe / Plaćanja
- `src/lib/stripe.ts` — Stripe client singleton
- `src/app/api/stripe/create-checkout-session/route.ts` — Checkout session API
- `src/app/api/stripe/webhook/route.ts` — Webhook handler
- `src/app/checkout/page.tsx` — Checkout page
- `src/components/checkout/CheckoutForm.tsx` — Forma za checkout
- `src/components/cart/CartSummary.tsx` — Sažetak košarice

### Admin
- `src/app/admin/page.tsx` — Dashboard
- `src/app/admin/orders/page.tsx` — Liste narudžbi
- `src/app/admin/orders/[id]/page.tsx` — Detalj narudžbe
- `src/app/admin/products/page.tsx` — Liste proizvoda
- `src/app/admin/products/[id]/edit/page.tsx` — Edit proizvoda
- `src/components/admin/ProductForm.tsx` — Forma za proizvod
- `src/lib/actions/orders.ts` — Server actions za narudžbe

### Baza
- `prisma/schema.prisma` — Prisma shema
- `src/lib/db.ts` — Prisma client

### API rute
- `src/app/api/admin/products/[id]/route.ts` — PATCH za proizvod
- `src/app/api/admin/orders/route.ts` — GET/POST narudžbe
- `src/app/api/admin/orders/[id]/route.ts` — PATCH narudžbe
- `src/app/api/catalog/products/route.ts` — Javni katalog API
- `src/app/api/catalog/categories/route.ts` — Kategorije API

---

## 5. Što još nedostaje

- [ ] StripeEvent tablica za idempotenciju webhooka
- [ ] Stock adjustment tracking (`stockAdjustedAt`)
- [ ] Audit log za promjene statusa narudžbe
- [ ] Rate limiting na login, checkout, contact form
- [ ] Soft delete za proizvode (ARCHIVED status umjesto DELETE)
- [ ] Brand admin konzistentnost s produktima
- [ ] Katalozi admin/public konzistentnost
- [ ] Testovi (nema ih)
- [ ] Playwright smoke testovi
