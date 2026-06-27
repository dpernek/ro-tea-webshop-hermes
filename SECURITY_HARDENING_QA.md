# SECURITY HARDENING QA — Faza 8

## Date
2026-06-27

## Summary

Dodan rate limiting za admin write rute i login, brute-force zaštita logina, input hardening kroz postojeći Zod schema layer.

---

## Rate Limiting

### Implementacija
- `src/lib/rate-limiter.ts` — sliding-window in-memory limiter
- `src/lib/rate-limit-admin.ts` — wrapper za admin rute

### Pokrivene rute
| Ruta | Metoda | Limit |
|------|--------|-------|
| `/api/auth/callback/credentials` | POST | 5/min po emailu, 10/min po IP |
| `/api/admin/products` | POST | 30/min |
| `/api/admin/orders` | PATCH | 30/min |
| `/api/admin/orders/create` | POST | 30/min |

### 429 Response format
```json
{ "error": "Previše zahtjeva. Pokušajte ponovno za minutu." }
```
Uz `Retry-After` HTTP header.

---

## Brute-Force Protection

### Implementacija
- `src/lib/auth.ts` — `checkLoginBruteForce()` u authorize funkciji
- Nakon 5 neuspješnih pokušaja po emailu unutar 60s, login se blokira
- Ne otkriva se postoji li korisnik ili ne

---

## Input Hardening

Sve admin write rute već koriste Zod `safeParse` s whitelistom polja. Dodatno:
- Email normalizacija (lowercase + trim)
- Slug format guard na PATCH
- Null/undefined handling konzistentan kroz `emptyStringToNull` preprocessor

---

## Error Hygiene

- Admin API rute već vraćaju `{ error: "..." }` ili `{ errors: {...} }`
- Interni stack traceovi se ne prosljeđuju klijentu
- Postojeći `catch` blokovi logiraju console.error ali vraćaju generičku poruku

---

## Upload Security

Potvrđeno (audit only):
- Magic bytes validacija putem existing upload route-a
- Max size guard (10MB)
- Allowed MIME types (image/png, image/jpeg, image/webp)
- File path ne ovisi o user-provided nazivu

---

## Admin Auth / Session

- `requirePermission()` provjerava session + DB state (ne samo stale token)
- Disabled/deactivated user → 403
- STAFF ne može pristupiti ADMIN-only rutama
- Self-protection na users ruti aktivna

---

## What Was Left Out

- Rate limiting na GLS specifične rute (niska frekvencija poziva)
- Rate limiting na public `/api/coupons/validate` (niska frekvencija)
- `res.ok` guard na svim admin fetch pozivima (pre-existing, audit only)
- HTTPS enforcement (Vercel default, nije potreban u kodu)
- CSP headers (već postoje)

---

## Commit
`b655b72`
