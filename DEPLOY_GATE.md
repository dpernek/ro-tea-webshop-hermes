# RO-TEA Deploy Gate & Verification Discipline

## Definition of Done (Deploy Gate)

Prije nego se promjena smatra deployanom i verificiranom:

### 1. Lokalno
```bash
npm run lint       # 0 errors (warnings are acceptable if pre-existing)
npm run build      # must pass
```

### 2. Push + Deploy
```bash
git push origin main
vercel deploy --prod   # ili GitHub webhook auto-deploy
```

### 3. Production Smoke Test
```bash
node scripts/smoke-production.mjs
```
Pokriva **20 ruta**: homepage, katalog, 3 product detaila, 2 category listinga, cart, checkout, admin login, legal stranice, 5 API endpointa, sitemap.

### 4. QA Content Guard
Smoke test **WARN-uje** ako na homepageu pronađe QA/test stringove:
- `QA-CMS`, `QA-CTA`, `Changed via QA`, `QA Kategorije`, `[CLAIM:QA]`

Ne faila test — samo upozorava.

## "Verified" Discipline

| Oznaka | Značenje |
|--------|----------|
| **VERIFIED NOW** | Runtime dokaz na deployanom kodu u ovom passu (API response, browser snapshot, curl output) |
| **VERIFIED PREVIOUSLY** | Dokazano u ranijem passu, nije ponavljano. VAŽI SAMO ako deployani kod nije mijenjan u tom dijelu |
| **NOT VERIFIED** | Eksplicitno nedokazano. Nema pretpostavki |
| **CODE ONLY / CODE CONNECTED** | NIJE ekvivalent runtime verified — samo znači da kod postoji |

## Runtime Ops Checklist (nakon svakog deploya)

- [ ] Homepage `/` — 200, nema QA content, CMS vidljiv
- [ ] Katalog `/proizvodi` — 200, proizvodi se učitavaju
- [ ] Cart `/kosarica` — 200
- [ ] Checkout `/checkout` — 200
- [ ] Admin login `/admin/login` — 200
- [ ] Admin orders `/admin/orders` — 200 (zahtijeva login)
- [ ] Admin products `/admin/products` — 200 (zahtijeva login)
- [ ] API `/api/catalog/products` — 200, JSON, total > 0
- [ ] API `/api/shipping` — 200, 3 metode dostave

## Run Smoke Test
```bash
node scripts/smoke-production.mjs
```

### Primjer PASS outputa
```
PASS | Homepage           | 200  | body=✓ | err=✓ | https://...
PASS | Katalog            | 200  | body=✓ | err=✓ | https://...
PASS | Product 1          | 200  | body=✓ | err=✓ | https://...
...
Passed: 20/20  Failed: 0
```

### FAIL kriteriji
- HTTP status ≠ 200 (gdje se očekuje 200)
- Prazan body
- Application error shell (`DIGEST`, `This page couldn't load`, itd.)
- Neispravan JSON na API rutama
- < 1 product/category slug

### WARN (non-blocking)
- QA/test content otkriven na homepageu
