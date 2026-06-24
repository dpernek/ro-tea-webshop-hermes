# LEGAL CONTENT QA — RO-TEA Webshop

**Date:** 2026-06-24
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## 1. Route Verification

| # | Route | HTTP | Status |
|---|-------|------|--------|
| 1 | /pravila-o-privatnosti | 200 | ✅ |
| 2 | /uvjeti-kupnje | 200 | ✅ |
| 3 | /izjava-o-sigurnosti-online-placanja | 200 | ✅ |
| 4 | /pravila-povrata-i-zamjene | 200 | ✅ |
| 5 | /jednostrani-raskid-ugovora | 200 | ✅ |

---

## 2. Footer Links

Footer contains all legal links:
- Pravila privatnosti (/pravila-o-privatnosti)
- Uvjeti kupovine (/uvjeti-kupnje)
- Sigurnost placanja (/izjava-o-sigurnosti-online-placanja)
- Povrat i zamjena (/pravila-povrata-i-zamjene)
- Raskid ugovora (/jednostrani-raskid-ugovora)

---

## 3. Sitemap

All 5 routes included in sitemap with monthly frequency and 0.6 priority.

---

## 4. Content Source Check

| Route | Source | CorvusPay | Placeholder |
|-------|--------|-----------|-------------|
| pravil... privatnosti | ro-tea.hr adapted | None ✅ | None ✅ |
| uvjeti-kupnje | ro-tea.hr adapted | None ✅ | None ✅ |
| izjava-o-sigurnosti | New (Stripe) | Stripe only ✅ | None ✅ |
| pravila-povrata | ro-tea.hr adapted | None ✅ | None ✅ |
| jednostrani-raskid | ro-tea.hr adapted | None ✅ | None ✅ |

---

## 5. Build & Lint

| Check | Result |
|-------|--------|
| npm run build | PASS ✅ |
| npm run lint | 0 errors, 23 warnings ✅ |

---

## 6. Known Items

- Admin payments page has "Corvus" as a dropdown option (admin-only, not public)
- pravila-dostave template warning removed (commit d91133c)
- Email templates use shared legal footer from email.ts

---

## 7. Legal Disclaimer

Prije javnog oglašavanja i spajanja live domene, vlasnik mora:
- Pregledati sve pravne stranice i uskladiti ih s trenutnim poslovanjem
- Potvrditi točnost podataka o dostavi, cijenama i uvjetima
- Provjeriti Stripe security izjavu s obzirom na aktivni Stripe account
