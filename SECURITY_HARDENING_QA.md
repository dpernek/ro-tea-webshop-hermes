# SECURITY HARDENING QA — Faza 8 (Corrected)

## Date
2026-06-28

## Summary

Iskorišten postojeći rate limiting sustav (`src/lib/rate-limit.ts` + `src/proxy.ts`). Dodani admin write i coupons validate rate limiteri u proxy sloj. Dodana Zod validacija na `/api/coupons/validate`. Uklonjeni duplicirani rate limiter fajlovi.

---

## Rate Limiting (via proxy.ts)

| Ruta | Limit | Max tokens | Window |
|------|-------|-----------|--------|
| `/api/auth/callback/credentials` (POST) | login | 5 | 15s |
| `/api/stripe/create-checkout-session` (POST) | checkout | 10 | 60s |
| `/api/contact` (POST) | kontakt | 3 | 60s |
| `/api/admin/upload` (POST) | upload | 20 | 60s |
| **Sve `/api/admin/*` (POST/PUT/PATCH/DELETE)** | admin write | 60 | 60s |
| `/api/coupons/validate` (POST) | kupon | 30 | 60s |

Svi admin write rute (products, categories, brands, shipping, coupons, users, orders, settings, content, catalogs, GLS, upload, migrations) pokrivene kroz jedan proxy rule.

Response: HTTP 429, plain text "Previše zahtjeva. Pokušajte ponovo kasnije."

---

## Brute-Force Protection

Login brute-force zaštita kroz dva sloja:
1. **Proxy sloj** (loginLimiter) — 5 pokušaja / 15s po IP adresi (vraća 429)
2. **Authorize hook** — nema dodatne email-based zaštite (proxy je dovoljan)

Vercel edge distribucija: svaki edge node ima vlastiti in-memory store. Pod heavy loadom više nodeova može dopustiti više pokušaja, ali pruža osnovnu zaštitu.

---

## Input Hardening

| Ruta | Validacija | Status |
|------|------------|--------|
| `/api/coupons/validate` | Zod schema (`code`, `subtotal`) | ✅ Dodana |
| Sve admin write rute | Postojeći Zod `safeParse` | ✅ |
| Email normalizacija | lowercase + trim | ✅ |
| Slug format guard | Regex na PATCH | ✅ |

---

## What Was Left Out

- Email-based brute-force tracking u authorize hooku (proxy sloj je dovoljan)
- Per-resource admin write rate limiting granularnost (globalni admin write limit je dovoljan za prvi pass)
- Vercel edge-distribuirani rate limiting (zahtijeva eksterni store — izvan scopea)

---

## Commit
`2e4e07e`
