# GLS TEST INTEGRATION — RO-TEA Webshop

**Datum:** 2026-06-25
**Commit:** 26f4bbb
**Status:** TEST MODE (nije live)

---

## 1. Što je implementirano

| Komponenta | Status |
|------------|--------|
| GLS SOAP klijent (SHA512 auth, TLS 1.2) | ✅ |
| PrepareLabels (kreiranje pošiljke) | ✅ |
| GetParcelStatuses (tracking) | ✅ |
| GetDeliveryPoints (paketomati) | ✅ |
| DeleteLabels (storniranje) | ✅ |
| Checkout: GLS dostava | ✅ |
| Checkout: GLS Paketomat | ✅ |
| Admin GLS panel | ✅ |
| API rute (5 endpointa) | ✅ |
| DB polja (8 GLS kolona) | ✅ |
| TEST MODE badge (amber) | ✅ |
| server-only zaštita | ✅ |

## 2. GLS API metode (stvarno spojene)

| Metoda | Implementacija |
|--------|----------------|
| PrepareLabels | `src/lib/shipping/gls/prepareLabels.ts` |
| GetParcelStatuses | `src/lib/shipping/gls/parcelStatus.ts` |
| GetDeliveryPoints | `src/lib/shipping/gls/deliveryPoints.ts` |
| DeleteLabels | `src/lib/shipping/gls/deleteLabels.ts` |

## 3. Env varijable

| Varijabla | Default | Opis |
|-----------|---------|------|
| GLS_TEST_MODE | true | Test mod (amber badge u adminu) |
| GLS_API_BASE_URL | api.test.mygls.hr | GLS API base URL |
| GLS_USERNAME | — | GLS korisničko ime |
| GLS_PASSWORD | — | GLS lozinka (SHA512 automatski) |
| GLS_CLIENT_NUMBER | — | GLS ClientNumber |
| GLS_COUNTRY_CODE | HR | ISO kod države |

## 4. Za live prelazak

1. Postavi env varijable (GLS_TEST_MODE=false, produkcijski URL)
2. Pokreni migraciju za GLS kolone
3. Makni test badgeove automatski

## 5. API rute

- `GET /api/shipping/gls/delivery-points`
- `POST /api/admin/orders/[id]/gls/create`
- `POST /api/admin/orders/[id]/gls/status`
- `GET /api/admin/orders/[id]/gls/label`
- `POST /api/admin/orders/[id]/gls/cancel`

## 6. QA rezultat

```
lint:   1 error (pre-existing React compiler), 7 warnings
build:  ✅
```
