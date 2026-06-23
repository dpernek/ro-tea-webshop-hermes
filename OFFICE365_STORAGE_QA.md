# OFFICE365 STORAGE QA — RO-TEA Webshop

**Branch:** `production-office365-storage`
**Date:** 2026-06-23
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Commits

| Hash | Faza | Opis |
|------|------|------|
| `f68f7f0` | 1 | Supabase Storage finalizacija |
| `3e81881` | 2+3 | Microsoft Graph email provider |
| `7c12145` | 5+6 | Admin test email + docs |

---

## Verified Live

| Test | Result |
|------|--------|
| Build | ✅ |
| `/katalozi` from DB | ✅ |
| `/checkout/success?session_id=FAKE` not confirmed | ✅ |
| `/checkout/uspjeh?orderNumber=FAKE` not found | ✅ |
| `/api/orders/status?orderNumber=FAKE` 404 | ✅ |
| Upload production error (local blocked) | ✅ |
| Email wiring unchanged (compatible) | ✅ |
| Admin email test route exists | ✅ |
| No Resend dependency | ✅ |
| .env.example has Microsoft 365 vars | ✅ |

---

## Not Verified (needs owner setup)

| Item | What's needed |
|------|---------------|
| Supabase Storage bucket | Owner must create "images" bucket in Supabase Dashboard |
| Microsoft Graph sendMail | Owner must register Entra App, grant Mail.Send consent |
| Microsoft client secret | Must be set in Vercel env |
| Upload to Supabase Storage | Only tested concept — bucket not created |

---

## Env Variables Owner Must Set in Vercel

### Supabase Storage
- `SUPABASE_STORAGE_BUCKET=images`
- `UPLOAD_PROVIDER=supabase-storage`
- `NEXT_PUBLIC_SUPABASE_URL` (already set)
- `SUPABASE_SERVICE_ROLE_KEY` (already set)

### Microsoft 365 Email
- `EMAIL_PROVIDER=microsoft-graph`
- `MICROSOFT_TENANT_ID=...`
- `MICROSOFT_CLIENT_ID=...`
- `MICROSOFT_CLIENT_SECRET=...`
- `MICROSOFT_SENDER_USER=info@ro-tea.hr`
- `ORDER_NOTIFICATION_EMAIL=info@ro-tea.hr`

---

## NOT TOUCHED
- Stripe live mode: test keys only
- Custom domain: not configured
- Production orders: untouched
