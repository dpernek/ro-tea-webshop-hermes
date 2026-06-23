# PRELAUNCH QA — RO-TEA Webshop

**Branch:** `production-prelaunch-hardening`
**Date:** 2026-06-23
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Commits

| Hash | Faza | Opis |
|------|------|------|
| `ab09a74` | 1 | Production-safe uploads (Supabase Storage default) |
| `5b5dc4d` | 2 | Email notifications via Resend |
| `5ca9c1e` | 2-6 | Email wiring + security + admin UX + SEO |

---

## Verified Live

| Test | Result |
|------|--------|
| Build | ✅ |
| `/checkout/success?session_id=FAKE` → "Narudžba nije pronađena" | ✅ |
| `/checkout/uspjeh?orderNumber=FAKE` → "Narudžba nije pronađena" | ✅ |
| `/katalozi` from DB (not static) | ✅ |
| Stock 0 blocks Stripe checkout | ✅ |
| Stripe shipping option in checkout | ✅ |
| Webhook 500 on error | ✅ |
| Orders visible in admin | ✅ |
| Security headers (CSP, noindex) | ✅ |
| Rate limiting (login, checkout, contact, upload) | ✅ |
| CSV export orders | ✅ |
| Email templates ready | ✅ |

---

## Not Yet Verified (needs production env)

| Item | Why |
|------|-----|
| Stripe live payment | Test keys only |
| Apple Pay / Google Pay | Needs domain verification |
| Supabase Storage upload | Needs bucket creation |
| Resend email delivery | Needs RESEND_API_KEY set |
| Custom domain | Not yet configured |

---

## Owner Manual Steps Before Public Launch

1. **Rotate admin password** — Vercel Dashboard → `ADMIN_PASSWORD`
2. **Stripe live keys** — Replace `sk_test_` with `sk_live_`, update `pk_test_` to `pk_live_`
3. **Stripe production webhook** — Create new endpoint in Stripe Dashboard
4. **Apple Pay / Google Pay domain verification** — Stripe Dashboard → Settings → Payment methods
5. **Custom domain** — Vercel → Domains → Add domain
6. **Supabase Storage bucket** — Create `images` bucket in Supabase Dashboard, set to public
7. **Email provider** — Set `RESEND_API_KEY` in Vercel env
8. **Live test order** — Place one real order, verify end-to-end, then refund
9. **Rate limit fine-tuning** — Adjust limits based on traffic
