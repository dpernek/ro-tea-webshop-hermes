# Deploy Gate

Nijedan pass nije gotov dok ovo nije prošlo.

## Pokretanje

```bash
node scripts/smoke-production.mjs                      # produkcija
node scripts/smoke-production.mjs <staging-url>        # staging/preview
```

## Što skripta radi

1. Dohvaća stvarne product/category slugove iz live API-ja
2. Gradi listu kritičnih ruta (homepage, katalog, 3 produkta, 2 kategorije, katalozi, API endpointi, sitemap)
3. Provjerava svaku rutu: HTTP status, non-empty body, error shell
4. Za API — validan JSON. Za sitemap — validan XML root
5. Faila ako source API za slugove nije zdrav

## Fail kriteriji

- HTTP status ≠ 200
- Prazan response body
- `This page couldn't load`
- `Application error`
- `DIGEST` u HTML-u
- JSON neparsable (za API rute)
- Nedostaje XML root (za sitemap)

## Definition of Done

1. `npm run lint` — 0 errors
2. `npm run build` — prolazi
3. Vercel production deploy
4. `node scripts/smoke-production.mjs` — sve rute PASS

**Ako ijedna ruta padne — pass nije gotov.**
