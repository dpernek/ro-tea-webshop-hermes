# RO-TEA Webshop

Kompletna web trgovina s admin panelom za RO-TEA — specijaliziranu trgovinu tehničkom opremom, alatima, elektro materijalom i rješenjima za domaćinstvo.

## Stack

| Sloj       | Tehnologija                                 |
| ---------- | ------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org/)           |
| UI         | React 19, TypeScript                        |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com/) |
| Baza       | Prisma 7 + SQLite (dev) / PostgreSQL (prod) |
| Auth       | NextAuth.js v5 (Credentials)                |
| State      | Zustand + persist                           |
| Validacija | Zod, React Hook Form (checkout) — admin forme: osnovna HTML validacija |
| Animacije  | GSAP                                        |
| Ikone      | Lucide React                                |
| Deploy     | Vercel                                      |

## Brzi start (lokalno)

```bash
git clone https://github.com/dpernek/ro-tea-webshop-hermes
cd ro-tea-webshop-hermes
npm install

# Postavi .env
cp .env.example .env
# Uredi .env s pravim vrijednostima

# Generiraj Prisma client i kreiraj bazu
npm run db:generate
npm run db:push

# Seedaj admin korisnika i proizvode
npm run db:seed

# Pokreni dev server
npm run dev
```

## Env varijable

Kopiraj `.env.example` u `.env` i postavi:

| Varijabla                            | Opis                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| `DATABASE_URL`                       | SQLite za dev (`file:./dev.db`), PostgreSQL za prod        |
| `NEXTAUTH_SECRET`                    | Tajni ključ za JWT (generiraj s `openssl rand -base64 32`) |
| `NEXTAUTH_URL`                       | `http://localhost:3000` za dev                             |
| `ADMIN_EMAIL`                        | Email admin korisnika                                      |
| `ADMIN_PASSWORD`                     | Lozinka admin korisnika                                    |
| `STRIPE_SECRET_KEY`                  | Stripe secret key (placeholder za sada)                    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key                                     |
| `RESEND_API_KEY`                     | Resend API ključ za email                                  |
| `ADMIN_ORDER_EMAIL`                  | Email za primanje notifikacija narudžbi                    |

## Baza podataka

> **Napomena**: `prisma/schema.prisma` trenutno koristi `provider = "postgresql"`. Za lokalni dev sa SQLite, promijenite provider u `"sqlite"` i maknite `@updatedAt` atribute.

### Lokalno (SQLite)

```bash
npm run db:generate   # Generiraj Prisma client
npm run db:push       # Kreiraj/updateaj bazu
npm run db:seed       # Seedaj admina, kategorije, proizvode, shipping metode
```

### Produkcija (PostgreSQL)

Na Vercelu postavi `DATABASE_URL` na PostgreSQL connection string (npr. Vercel Postgres, Neon, Supabase):

```env
DATABASE_URL="postgresql://user:password@host:5432/rotea"
```

Zamijeni provider u `prisma/schema.prisma` sa `postgresql`.

## Import proizvoda

Postojeći proizvodi se uvoze na dva načina:

### 1. Iz XML-a (WooCommerce export)

```bash
npm run import:products
```

Ovo pokreće `scripts/import-woocommerce-products.py` koja čita `ro-tea.WordPress.2026-06-22.xml` i generira JSON datoteke u `src/data/`.

### 2. U bazu (iz JSON-a)

```bash
npm run db:seed
```

Seed skripta učitava `src/data/products.json`, `src/data/categories.json` i `src/data/brands.json` u Prisma bazu.

### Ponovni import

Nakon novog WordPress exporta:

1. Stavite novi XML u root projekta kao `ro-tea.WordPress.2026-06-22.xml`
2. Pokrenite `npm run import:products`
3. Pokrenite `npm run db:seed`

## Admin panel

### URL

```
/admin
```

### Prijava

Koristite email i lozinku definirane u `.env` (`ADMIN_EMAIL` i `ADMIN_PASSWORD`).

### Stranice

| Put                         | Opis                                    |
| --------------------------- | --------------------------------------- |
| `/admin`                    | Dashboard s ključnim statistikama       |
| `/admin/products`           | Pregled, pretraga, filteri, bulk akcije |
| `/admin/products/new`       | Dodavanje novog proizvoda               |
| `/admin/products/[id]/edit` | Uređivanje proizvoda                    |
| `/admin/categories`         | Upravljanje kategorijama                |
| `/admin/brands`             | Upravljanje brendovima                  |
| `/admin/orders`             | Pregled narudžbi                        |
| `/admin/orders/[id]`        | Detalji narudžbe, promjena statusa      |
| `/admin/customers`          | Pregled kupaca                          |
| `/admin/payments`           | Pregled uplata (⚠️ API ruta nedostaje — stranica prazna) |
| `/admin/shipping`           | Upravljanje metodama dostave            |
| `/admin/coupons`            | Upravljanje kuponima                    |
| `/admin/settings`           | Postavke webshopa                       |
| `/admin/katalozi`           | Upravljanje katalozima                  |
| `/admin/katalozi/novi`      | Dodavanje novog kataloga                |
| `/admin/katalozi/[id]/uredi`| Uređivanje kataloga                     |

## Frontend rute

| URL                      | Opis                                        |
| ------------------------ | ------------------------------------------- |
| `/`                      | Početna s featured proizvodima              |
| `/proizvodi`             | Katalog s filterima, pretragom, paginacijom |
| `/proizvodi/[slug]`      | Detalji proizvoda                           |
| `/kosarica`              | Pregled i uređivanje košarice               |
| `/checkout`              | Checkout s odabirom dostave i plaćanja      |
| `/kategorije/[slug]`     | Proizvodi u kategoriji                      |
| `/kontakt`               | Kontakt stranica                            |
| `/o-nama`                | O nama                                      |
| `/uvjeti-kupnje`         | Uvjeti kupnje                               |
| `/politika-privatnosti`  | Politika privatnosti (GDPR)                 |
| `/pravila-dostave`       | Pravila dostave                             |
| `/povrati-i-reklamacije` | Povrati i reklamacije                       |
| `/usluga-brusenja`       | Usluga brušenja                             |
| `/katalozi`              | Pregled PDF kataloga                        |

## Checkout flow

1. Kupac dodaje proizvode u košaricu (Zustand + localStorage)
2. Na checkout stranici unosi podatke za dostavu
3. Odabire metodu dostave (kurir / osobno preuzimanje)
4. Odabire metodu plaćanja (kartica / bankovna uplata / pouzeće)
5. Prihvaća uvjete kupnje
6. Narudžba se sprema u bazu, generira se `ROTEA-YYYYMMDD-XXXX` broj
7. Zalihe proizvoda se automatski smanjuju
8. Košarica se prazni
9. Prikazuje se potvrda s brojem narudžbe

## Plaćanja

Sustav plaćanja je modularan. Trenutno podržava:

- **Bankovna uplata** — narudžba ide u `PENDING` / `UNPAID`, kupac dobiva upute za uplatu
- **Pouzeće** — narudžba ide u `CONFIRMED` / `PENDING`
- **Kartica (Stripe)** — placeholder, implementacija preko Stripe Checkout Session

Dodatni provideri (Monri, Corvus) se dodaju kroz isti interface u `src/lib/actions/orders.ts`.

## Dostava

Upravlja se iz admin panela (`/admin/shipping`). Podržane metode:

- Dostava kurirskom službom (definirana cijena)
- Osobno preuzimanje (besplatno)
- Besplatna dostava iznad definiranog iznosa

## Slike

Za dodavanje slika proizvoda u admin panelu:

- **Trenutno**: samo URL slike (npr. `https://ro-tea.hr/wp-content/uploads/...`). Nema file upload route.
- **Planirano**: Vercel Blob ili Cloudinary upload (treba dodati API rutu za upload).

Za Next.js Image optimizaciju, dodani su `remotePatterns` za `ro-tea.hr` u `next.config.ts`.

## Email obavijesti

Email sustav je pripremljen ali nije aktivan. Za aktivaciju:

1. Postavite `RESEND_API_KEY` i `ADMIN_ORDER_EMAIL` u `.env`
2. Aktivirajte pozive u `src/lib/actions/orders.ts` nakon `createOrder`

## Fiskalizacija

Placeholder u admin postavkama. Za implementaciju u Hrvatskoj potrebno:

1. Dodati OIB, podatke tvrtke u StoreSettings
2. Integrirati CIS (Porezna uprava) API
3. Implementirati izdavanje računa

## Produkcijski readiness

### ✅ Spremno

- Frontend webshop s 848+ proizvoda
- Admin panel s autentikacijom
- CRUD za proizvode, kategorije, brendove, kataloge
- Upravljanje narudžbama i statusima
- Upravljanje kuponima (admin CRUD)
- Upravljanje metodama dostave
- Checkout s kreiranjem narudžbi u bazi
- Upravljanje zalihama
- GDPR stranice

### ⚠️ Placeholder / treba dovršiti

- Stripe/Monri/Corvus integracija (trenutno samo manual payment i pouzeće)
- Email obavijesti (Resend/SendGrid)
- Upload slika (Vercel Blob/Cloudinary) — trenutno samo URL slike
- Validacija u admin formama (Zod/RHF) — trenutno samo osnovna HTML validacija
- Varijacije proizvoda (XML export ne sadrži `product_variation` zapise)
- Fiskalizacija
- Kuponi — integracija na checkoutu (admin CRUD radi)
- `/api/admin/payments` ruta — nedostaje, payments stranica je prazna
- `/admin/brands/edit` — nema zasebnu edit stranicu, koristi inline edit

## npm skripte

```bash
npm run dev              # Pokreni dev server
npm run build            # Build za produkciju
npm run format           # Formatiraj s Prettierom
npm run lint             # Lint s ESLintom
npm run db:generate      # Generiraj Prisma client
npm run db:push          # Pushaj schema u bazu
npm run db:migrate       # Kreiraj migracije
npm run db:seed          # Seedaj admina + proizvode
npm run import:products  # Uvezi iz WooCommerce XML-a
```

## Build i deploy

```bash
npm run format
npm run build
git add .
git commit -m "poruka"
git push origin main
npx vercel --prod --yes
```

## Live URL

https://ro-tea-webshop-hermes.vercel.app

## GitHub

https://github.com/dpernek/ro-tea-webshop-hermes
