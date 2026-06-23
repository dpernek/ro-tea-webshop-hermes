# RO-TEA Webshop

Profesionalna web trgovina za RO-TEA d.o.o. — alati, tehnička oprema, brusni materijali.

## Stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Baza | Prisma 7 + PostgreSQL (Supabase) / SQLite (dev) |
| Auth | NextAuth.js v5 (Credentials, DB-backed) |
| State | Zustand (cart) |
| Validacija | Zod v4 (admin API + forme) |
| Animacije | GSAP |
| Ikone | Lucide React |
| Deploy | Vercel (auto-deploy s main brancha) |
| Slike | Lokalne (public/images/) + AI generirane |

## Brzi start

```bash
git clone https://github.com/dpernek/ro-tea-webshop-hermes.git
cd ro-tea-webshop-hermes
cp .env.example .env
# uredi .env — postavi ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL
npm install
npx prisma generate
npm run dev
```

## Admin

Admin panel je na `/admin`. Login koristi NextAuth v5 Credentials provider.

**Početni admin** se kreira automatski na prvi login ako:
- `ADMIN_EMAIL` i `ADMIN_PASSWORD` env varijable su postavljene
- Baza nema nijednog korisnika (`User` tablica prazna)

Sigurnost:
- Middleware provjerava JWT session cookie i `role: ADMIN`
- Ne-ADMIN korisnici dobivaju 403
- `callbackUrl` je sanitiziran — samo interne `/admin` putanje
- Sve admin API rute su zaštićene i validiraju inpute (Zod + field whitelisting)
- Admin layout je odvojen od javnog — nema Header/Footer/CookieBanner

### Admin funkcionalnosti

| Ruta | Status |
|---|---|
| `/admin` | Dashboard s brojčanim statistikama iz baze |
| `/admin/login` | Login forma |
| `/admin/products` | Lista s pretragom, paginacijom, soft-delete |
| `/admin/products/new` | Forma za novi proizvod s uploadom slika |
| `/admin/products/[id]/edit` | Edit proizvoda s pre-populacijom i loading/error stanjima |
| `/admin/categories` | Inline CRUD |
| `/admin/brands` | Inline CRUD |
| `/admin/orders` | Lista s filterima po statusu |
| `/admin/orders/[id]` | Detalji + promjena statusa (samo status/paymentStatus/adminNote) |
| `/admin/customers` | Lista kupaca |
| `/admin/shipping` | CRUD metoda dostave |
| `/admin/coupons` | CRUD kupona |
| `/admin/settings` | Postavke trgovine |
| `/admin/katalozi` | CRUD PDF kataloga |
| `/admin/payments` | Pregled plaćanja s filterima |

**CRUD API rute**: 12 ruta s punom Zod validacijom i field whitelistingom.
**Soft-delete**: Proizvodi se arhiviraju (`ARCHIVED`), ne brišu fizički.
**Kategorije/Brendovi**: Provjera postoje li povezani proizvodi prije brisanja.

### Placesholder / U razvoju

- **Upload slika**: Radi (multipart POST na `/api/admin/upload`), ali admin može i ručno unijeti URL.
- **Validacija admin formi**: Sve forme imaju Zod validaciju na frontendu i backendu. HTML `required` atributi su dodatna zaštita.

## Frontend — javne rute

| Ruta | Opis |
|---|---|
| `/` | Homepage s hero slideshowom, kategorijama, istaknutim proizvodima |
| `/proizvodi` | Katalog — server-side init, search, filteri, load-more 24 |
| `/proizvodi/[slug]` | Product detail — galerija, specifikacije (553 proizvoda), srodni, ReadMore |
| `/kategorije/[slug]` | Kategorije — sidebar s brojem proizvoda |
| `/kosarica` | Košarica |
| `/checkout` | Blagajna — server-side kalkulacija cijena |
| `/checkout/uspjeh` | Potvrda narudžbe |
| `/usluga-brusenja` | Usluga brušenja |
| `/katalozi` | PDF katalozi (PFERD, FESTA, Metabo...) |
| `/kontakt` | Kontakt forma + B2B sekcija |
| `/o-nama` | O nama — povijest, djelatnosti, partneri |
| `/uvjeti-kupnje` | Uvjeti kupnje (+ R1 račun) |
| `/pravila-dostave` | Pravila dostave |
| `/povrati-i-reklamacije` | Povrati i reklamacije |
| `/politika-privatnosti` | Politika privatnosti |

## Checkout sigurnost

- `createOrder` NE vjeruje klijentskim cijenama
- Cijene i ukupno se računaju server-side iz baze
- Provjerava se da su proizvodi ACTIVE
- Dostava: 6.64 €, besplatno iznad 66.36 €, osobno preuzimanje = 0 €
- Smanjenje zalihe nakon narudžbe

## SEO

- Metadata (title, description, canonical) na svim stranicama
- OpenGraph + Twitter cards
- JSON-LD Product structured data na product detail stranicama
- Dinamički `sitemap.xml` (svi proizvodi + kategorije)
- `robots.txt` (blokira `/admin`)

## Env varijable

```
AUTH_SECRET=...         # NextAuth v5 JWT secret
AUTH_URL=http://localhost:3000  # (lokano) ili https://ro-tea-webshop-hermes.vercel.app
DATABASE_URL=...        # PostgreSQL connection string (produkcija) ili file:./dev.db (dev)
ADMIN_EMAIL=...         # Email za auto-seed početnog admina
ADMIN_PASSWORD=...      # Lozinka za auto-seed početnog admina
NEXT_PUBLIC_SUPABASE_URL=https://fmqcjvoemdmghikrzulk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

