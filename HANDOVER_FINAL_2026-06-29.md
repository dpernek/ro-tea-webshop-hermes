# RO-TEA Webshop — Završni Handover

**Datum:** 29. lipnja 2026.  
**Branch:** `main`  
**Produkcija:** https://ro-tea-webshop-hermes.vercel.app  

---

## 1. Sažetak stanja

Webshop je operativan u svim ključnim segmentima:

- **Storefront**: katalog 846 proizvoda, pretraga, filteri, product detail s cijenama i stock statusom
- **Košarica/Checkout**: dodavanje u košaricu, kupon, 3 načina plaćanja (kartica, banka, pouzeće), 3 načina dostave (osobno, GLS kućna, GLS Paketomat)
- **Admin**: dashboard, upravljanje proizvodima/narudžbama/kategorijama/brandovima/kuponima/sadržajem
- **GLS**: kreiranje pošiljki za kućnu dostavu i Paketomat, COD podrška, storno
- **Security**: rate limiting za login, admin write rute, kupon validaciju, upload zaštita

---

## 2. Verified područja

### Verified now (29. lipnja 2026.)

| Područje | Što je provjereno |
|----------|-------------------|
| Storefront | 18 ruta, sve 200 osim nepostojeće kategorije (404) |
| Admin pages | 14 stranica, sve 200 |
| Admin APIs | 8 core API endpointa, svi 200 |
| Orders filters | status, paymentStatus, unread, gls, paymentMethod — svi rade |
| Products filters | status, sale, lowStock, stockStatus, search — svi rade |
| Deeplinkovi | Dashboard → orders/products — filteri se primjenjuju na prvom loadu (kroz client-side navigaciju) |
| Bulk filter parity | ARCHIVED, sale, lowStock, combined — bulk preview count = list total |
| CSV export | Svi filteri (unread/gls/paymentMethod) sada uključeni; export count = list total |
| Coupon flow | Validacija, persistiranje, prikaz u adminu |
| Checkout | Stripe session create, order persistence, sva polja |
| Low-stock semantics | Dashboard count = API filter count = bulk count |
| Sale price remove | Brisanje salePrice-a kroz edit formu — ispravno persistira null |
| Viewed lifecycle | Mark-viewed u GET ruti, unread count se ažurira |

### Verified previously (faze 6–8)

| Područje | Napomena |
|----------|----------|
| GLS home delivery create/cancel | Testirano u fazi 7 (parcelId 501443304, itd.) |
| GLS Paketomat create/cancel | Testirano u fazi 7 (ServiceList + PSDParameter) |
| GLS COD | Testirano u fazi 7 |
| Upload security | Magic bytes, max size |
| Admin CRUD | Categories, brands, shipping, coupons |
| Audit log | Zapisi za ključne write akcije |

---

## 3. Ključne poslovne mogućnosti

### Kupac
- Pregled kataloga (846 proizvoda, 16 kategorija, 3 brenda)
- Pretraga po nazivu i SKU/EAN
- Filtriranje po kategoriji i brendu
- Product detail: galerija, cijena (redovna + akcijska), EAN, stanje zalihe, trust badgevi
- Košarica s PDV-om, kuponom, dostavom
- Checkout: 3 načina plaćanja, 3 načina dostave, GLS Paketomat picker
- Legal stranice (uvjeti, privatnost, povrat, sigurnost plaćanja)

### Admin
- Dashboard s KPI karticama, attention blokom, recent orders, GLS statusom, audit logom
- Upravljanje proizvodima: filteri (status/sale/stock/search), sortiranje, bulk akcije s previewom
- Upravljanje narudžbama: filteri (5 tipova), status update, pregled detalja
- GLS operacije: create/cancel za kućnu dostavu i Paketomat, COD
- CMS: uređivanje homepage sadržaja (hero, trust repeater, CTA)
- Kuponi, dostava, PDF katalozi, korisnici, audit log
- CSV export narudžbi (respektira trenutne filtere)

---

## 4. Poznate otvorene stavke

### P2 / ne-blockirajuće

- 29 lint warnings (pre-existing, nisu funkcionalni bugovi)
- Direct URL deep-link (`browser_navigate` na `?status=PENDING`) ne sync-a filtere na cold load — Next.js Suspense/useSearchParams timing issue. Dashboard click (client-side nav) radi ispravno.
- "Niska zaliha" quick chip na products listi nije aktivan kad lowStock=yes nema rezultata (0 proizvoda)
- Admin order detail activity block koristi audit API, ne prikazuje automatske sistemske promjene statusa

### P3 / backlog

- Inventory management: lowStockThreshold u postavkama (trenutno hardcodiran ≤3)
- Automatske notifikacije za nove narudžbe (Telegram/webhook)
- Dashboard revenue po periodima (7d, 30d)
- Batch import/export proizvoda

---

## 5. Rizici / napomene

### Osjetljiva područja

- **Prisma schema**: svaka izmjena zahtijeva `prisma generate`. Svi produkcijski queryji sada imaju eksplicitni `select` — novi queryji moraju slijediti isti pattern.
- **GLS REST payload**: precizno mapiran (ServiceList, PSDParameter, PickupAddress). Izmjene payloada trebaju testirati s GLS API-jem.
- **Bulk filter parity**: frontend i backend sada dijele istu semantiku filtera kroz `buildFilterWhere`. Promjene na jednom zahtijevaju promjene na drugom.
- **Vercel rate limit**: 100 deploys/dan — planirati veće deployeve.

### Deploy gate

- `npm run lint` + `npm run build` obavezno prije pusha
- `node scripts/smoke-production.mjs` (12 testova) nakon deploya

---

## 6. Preporučeni sljedeći koraci

### P2 — idući prioritet

1. Popraviti direct URL deep-link na cold load (Suspense/useSearchParams issue)
2. Dodati `lowStockThreshold` u postavke umjesto hardcodiranog ≤3
3. Automatske notifikacije (Telegram) za nove narudžbe

### P3 — budućnost

4. Dashboard revenue grafika po periodima
5. Product batch import (CSV)
6. SEO: meta descriptions, sitemap

---

## 7. Verification note

- **Verified now**: storefront rute, admin load, filter/deeplink/chip ponašanje, bulk parity, CSV export, coupon flow, viewed lifecycle — sve provjereno u zadnjem passu (29. lipnja)
- **Verified previously**: GLS create/cancel/COD, upload security, admin CRUD — provjereno u ranijim fazama, nije ponavljano
- **Audit only**: product sort (radi ispravno), pricing logika (ispravna), security guardovi (postoje)

---

*Dokument izrađen za internu upotrebu — RO-TEA d.o.o.*
