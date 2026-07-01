# RO-TEA Stabilization Backlog

**Post-release stabilization backlog — srpanj 2026.**

Zatvoreno u stabilizacijskom radu (29.06.–01.07.2026.): admin orders workflow, products filter/deeplink parity, bulk selectAllFiltered, CSV export consistency, dashboard reporting, inventory stock management, CMS connection, post-purchase actions, deploy smoke test.

---

## P1 — Riješiti uskoro

### 1. Orders workflow QA rep — claim indikator na orders listi
**Problem:** Reklamacija (`[CLAIM:OPEN]` / `[CLAIM:RESOLVED]`) vidljiva samo na order detailu, ne na orders listi. Operativa ne može brzo filtriati reklamacije.

**Zašto otvoreno:** Dodavanje claim indikatora u orders list zahtijeva novi UI element ili dodatni API query. Scopeano za kasniji pass.

**Rizik:** Nizak — reklamacije su read-only u admin viewu, ali korisno za preglednost.

**Preporučeni idući korak:** Dodati `claimStatus` badge ili ikonu u orders list table row.

---

### 2. Category/brand SEO CMS rep
**Problem:** Admin category/brand stranice imaju `seoTitle`, `seoDescription`, `introText` polja, ali storefront ih ne koristi. Sve meta strane su hardcodirane.

**Zašto otvoreno:** Zahtijeva izmjenu category/brand storefront stranica + novi data flow. Nije blocking za core funkcionalnost.

**Rizik:** SEO ne koristi CMS podatke. Kupci vide generičke meta opise.

**Preporučeni idući korak:** Povezati `metaTitle`/`metaDescription` iz CMS-a u `generateMetadata()` za category/brand storefront stranice.

---

### 3. Direct URL deep-link na cold load (Suspense/useSearchParams)
**Problem:** Dashboard click → filtered orders/products radi, ali direktno otvaranje URL-a (`?status=PENDING`) ponekad ne sync-a filtere na prvom renderu. Next.js App Router Suspense/useSearchParams timing issue.

**Zašto otvoreno:** Tehnički zahtjevno — potreban server component wrapper ili SSR searchParams prosljeđivanje. Workaround postoji (dashboard click radi).

**Rizik:** Srednji — deeplinkovi iz eksternih izvora (email, linkovi) neće raditi pouzdano.

**Preporučeni idući korak:** Convert orders/products page u server component koji prosljeđuje `searchParams` u client component.

---

## P2 — Korisno, ali nije hitno

### 4. Lint warnings cleanup — ForbiddenCard dead code
**Problem:** 8 `ForbiddenCard` unused function definition warnings u 4 admin pagea (coupons, korisnici, settings, shipping). Dead code, ali nije breaking.

**Zašto otvoreno:** Pokušaj sed uklanjanja korumpirao kod. Potrebno pažljivo ručno brisanje.

**Preporučeni idući korak:** Ručno ukloniti `ForbiddenCard` funkcije (3-4 linije po fileu).

---

### 5. Lint warnings cleanup — unused `forbidden/setForbidden`
**Problem:** 3 `forbidden` state warninga u admin pagevima — varijable definirane ali ne korištene.

**Zašto otvoreno:** Dio permission guard patterna koji nije aktiviran. P3 debt.

**Preporučeni idući korak:** Ukloniti ili aktivirati guard pattern.

---

### 6. QA guard — WARN → FAIL opcija
**Problem:** QA content guard u smoke testu je WARN-only. Ne faila deploy.

**Zašto otvoreno:** Svjesna odluka — WARN je dovoljan za produkciju. FAIL opcija može se dodati za CI/CD pipeline.

**Preporučeni idući korak:** Dodati `--strict` flag koji pretvara WARN u FAIL.

---

### 7. Brand data cleanup — svi proizvodi imaju `brandId = null`
**Problem:** Brand filter postoji u storefrontu, ali 0 proizvoda je dodijeljeno brendovima. Feature radi, nema podataka.

**Zašto otvoreno:** Data issue — potreban import/seed da se proizvodi povežu s brandovima.

**Preporučeni idući korak:** Seed skripta ili admin bulk assign brandova na proizvode.

---

## P3 — Kasnije / po potrebi

### 8. Puni RMA sustav
Kreirati customer-facing portal za povrate/reklamacije s vlastitim workflowom, PDF obrascima i email notifikacijama. Trenutno je dovoljan admin-side claim tracking kroz `adminNote`.

### 9. Jači monitoring
Unaprijediti smoke test u CI/CD pipeline, dodati Sentry/DataDog integraciju, alerting za failed deploys, uptime monitoring.

### 10. Reporting 2.0
Proširiti dashboard s periodnim usporedbama, export u CSV/PDF, vizualne grafove (ne samo tablice).

### 11. Typo-tolerant search
Dodati fuzzy search podršku umjesto trenutnog `contains` (Prisma insensitive).

---

## Preporučeni redoslijed rada

1. Direct URL deep-link fix (P1)
2. Category/brand SEO CMS connection (P1)
3. Claim indikator na orders listi (P1)
4. Lint dead code cleanup — ForbiddenCard (P2)
5. Brand data cleanup (P2)
6. QA guard --strict opcija (P2)
7. Reporting 2.0 (P3)
8. Puni RMA sustav (P3)
