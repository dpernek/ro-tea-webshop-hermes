# RELEASE v1.0.0-production-ready

**Datum:** 2026-06-23
**Commit:** `c5a736b`
**Tag:** `v1.0.0-production-ready`
**Deploy URL:** https://ro-tea-webshop-hermes.vercel.app

---

## Migration Status

| Migracija | Status |
|-----------|--------|
| StripeEvent + stockAdjustedAt | ✅ Applied |
| Stripe kolone (Order) | ✅ Applied |
| Viewed kolona | ✅ Applied |

---

## Final QA Status: PASS ✅

Puni izvještaj: `FINAL_QA_REPORT.md`

| Sekcija | Rezultat |
|---------|----------|
| Git & Deploy | ✅ |
| Build & Lint | ✅ |
| Stripe E2E | ✅ |
| Webhook Idempotentnost | ✅ |
| Stock Edge Cases | ✅ |
| Admin Dashboard | ✅ |
| Product Edit | ✅ |
| Upload | ✅ |
| Frontend (10 ruta) | ✅ |
| SEO | ✅ |
| Sigurnost | ✅ |

---

## Vercel Environment Variables

Sve potrebne env varijable su postavljene:

- `STRIPE_SECRET_KEY` ✅
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- `NEXT_PUBLIC_SITE_URL` ✅
- `AUTH_SECRET` / `AUTH_URL` ✅
- `DATABASE_URL` / Supabase keys ✅
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` ✅

---

## Stripe Production Checklist

| Stavka | Status |
|--------|--------|
| Test secret key postavljen | ✅ `sk_test_...` |
| Test publishable key postavljen | ✅ `pk_test_...` |
| Webhook secret postavljen | ✅ `whsec_...` |
| Webhook URL produkcijski | ✅ `https://ro-tea-webshop-hermes.vercel.app/api/stripe/webhook` |
| Webhook events | ✅ checkout.session.completed/expired, payment_intent.succeeded/failed |

---

## Što vlasnik mora napraviti prije javnog oglašavanja

1. **Rotirati admin lozinku**: Trenutna lozinka je testna. Postavite novu u Vercel Dashboard → `ADMIN_PASSWORD`.
2. **Stripe produkcijski ključevi**: Zamijeniti `sk_test_...` i `pk_test_...` s produkcijskim ključevima iz Stripe Dashboarda (`sk_live_...`, `pk_live_...`).
3. **Stripe webhook za produkciju**: Kreirati novi webhook endpoint u Stripe Dashboardu za produkcijski environment.
4. **Apple Pay / Google Pay**: Registrirati/verificirati domenu `ro-tea-webshop-hermes.vercel.app` u Stripe Dashboard → Settings → Payment methods → Apple Pay / Google Pay.
5. **Vlastita domena**: Pointati vlastitu domenu na Vercel deployment i ažurirati `NEXT_PUBLIC_SITE_URL`.
6. **Upload storage**: Konfigurirati `UPLOAD_PROVIDER=supabase-storage` ili `cloudinary` za trajni storage (trenutno `local`).
7. **Email notifikacije**: Konfigurirati Resend ili drugi email provider za order confirmation emailove.
8. **Rate limiting**: Implementirati rate limiting na login, checkout i contact form rute.
9. **CSP headers**: Dodati Content-Security-Policy headere za dodatnu sigurnost.
