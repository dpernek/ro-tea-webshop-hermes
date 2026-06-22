# RO-TEA Webshop

Kompletna moderna web trgovina za RO-TEA — specijaliziranu trgovinu tehničkom opremom, alatima, elektro materijalom, rasvjetom, vodoinstalacijama i rješenjima za pametnu kuću.

## Što je napravljeno

Projekt predstavlja početnu (MVP) verziju produkcijski spremne web trgovine s:

- Modernim responzivnim dizajnom orijentiranim na B2C/B2B prodaju tehničke robe
- Preglednom navigacijom, kategorijama i filterima
- Stranicama proizvoda s galerijom, specifikacijama i košaricom
- Košaricom s trajnim spremanjem u `localStorage`
- Checkout flowom s validacijom na hrvatskom jeziku
- GSAP animacijama bez hydration grešaka
- Puno metadata i semantičkim HTML-om za SEO

## Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **UI library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [GSAP](https://gsap.com/) + ScrollTrigger
- **State management:** [Zustand](https://github.com/pmndrs/zustand) s `persist` middlewareom
- **Icons:** [Lucide React](https://lucide.dev/)
- **Formatting:** [Prettier](https://prettier.io/) + prettier-plugin-tailwindcss
- **Linting:** ESLint + eslint-config-next
- **Deployment target:** [Vercel](https://vercel.com/)

> **Napomena o deployu:** Projekt ne koristi `output: "export"` jer Vercelov Git-integrated pipeline očekuje standardni Next.js izlaz (`.next/`). Vercel automatski poslužuje stranice kao statičke kada je to moguće, što omogućuje jednostavan deploy izravno iz GitHub repozitorija.

## Kako pokrenuti lokalno

```bash
# 1. Kloniraj repozitorij
git clone https://github.com/dpernek/ro-tea-webshop-hermes.git
cd ro-tea-webshop-hermes

# 2. Instaliraj ovisnosti
npm install

# 3. Pokreni razvojni server
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u pregledniku.

## Kako buildati

```bash
npm run build
```

Build stvara produkcijsku verziju u `.next/` direktoriju. Nakon uspješnog builda možeš pokrenuti:

```bash
npm start
```

## Kako deployati na Vercel

### Opcija A: Vercel dashboard (preporučeno)

1. Posjeti [https://vercel.com/new](https://vercel.com/new)
2. Odaberi `dpernek/ro-tea-webshop-hermes` repozitorij
3. Klikni **Import**
4. Ostavi defaultne postavke (Framework Preset: Next.js)
5. Klikni **Deploy**

Vercel će automatski buildati i deployati svaki push na `main` granu.

### Opcija B: Vercel CLI

```bash
# Instaliraj Vercel CLI ako ga još nemaš
npm i -g vercel

# Poveži projekt i deployaj
npx vercel --prod
```

## Kako povezati GitHub repo s Vercelom

1. Uđi u Vercel dashboard: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Klikni **Add New... > Project**
3. Pod **Import Git Repository** odaberi `ro-tea-webshop-hermes`
4. Klikni **Import**
5. U postavkama projekta (`Settings > Git`) provjeri:
   - **Production Branch:** `main`
   - **Framework Preset:** Next.js
6. Klikni **Deploy**

Svaki sljedeći `git push` na `main` automatski će pokrenuti novi deploy.

## Import proizvoda iz WooCommerce XML-a

Proizvodi se ne unose ručno — generiraju se automatski iz WordPress/WooCommerce XML exporta.

### Preduvjeti

- Python 3 dostupan u terminalu
- WordPress export datoteka mora se zvati `ro-tea.WordPress.YYYY-MM-DD.xml` i nalaziti u rootu projekta
- Za parsiranje atributa koristi se `phpserialize` (instalira se ručno ako nije dostupan):
  ```bash
  pip3 install phpserialize
  ```

### Pokretanje importa

```bash
npm run import:products
```

Skripta čita XML, izdvaja:

- objavljene proizvode (`post_type = product`, `status = publish`)
- kategorije (`product_cat`)
- brendove (`product_brand`)
- slike preko `_thumbnail_id` → WordPress attachment zapisi
- galerije preko `_product_image_gallery`
- cijene, zalihe, SKU, opise i specifikacije

...i generira:

```
src/data/products.json   # svi importani proizvodi
src/data/categories.json # jedinstvene kategorije s brojem proizvoda
src/data/brands.json     # jedinstveni brendovi s brojem proizvoda
```

### Kako rade slike

Slike se ne skidaju lokalno u ovoj fazi. U generiranim JSON datotekama ostaju originalni `https://ro-tea.hr/wp-content/uploads/...` URL-ovi. Next.js `<Image>` komponenta učitava i optimizira te slike preko Vercela zahvaljujući `remotePatterns` konfiguraciji u `next.config.ts`.

### Proizvodi bez slike ili cijene

- Ako proizvod nema `_thumbnail_id` ili attachment ne postoji, koristi se `/images/placeholder.svg`
- Ako proizvod nema niti jednu cijenu, dodaje se značka **Cijena na upit** i `price: 0`

### Ponovni import nakon novog exporta

1. Preimenuj/prebaci novu XML datoteku u root projekta kao `ro-tea.WordPress.2026-06-22.xml` (ili ažuriraj ime u `scripts/import-woocommerce-products.py`)
2. Pokreni `npm run import:products`
3. Pokreni `npm run build`
4. Commitaj i pushaj promjene — Vercel će automatski redeployati

### Ručno ažuriranje (nakon importa)

Ako želiš naknadno promijeniti generirane JSON datoteke:

```
src/data/
  products.json    # svi proizvodi
  categories.json  # sve kategorije
  brands.json      # svi brendovi
  site.json        # brand podaci, kontakt, društvene mreže
```

Svaka promjena zahtijeva novi `npm run build` i `git push` da postane vidljiva online.

### Ograničenja

- **Varijabilni proizvodi** (`type = variable`) prikazuju se bez odabira varijacija. Na stranici proizvoda nalazi se gumb za upit umjesto gumba za izravnu kupnju. Potpuna podrška za varijacije zahtijeva dodatni razvoj.
- Količina zalihe (`_stock`) nije uvijek prisutna u exportu. Ako nedostaje, količina u košarici nije ograničena gornjim limitom.

## Struktura projekta

```
ro-tea-webshop-hermes/
├── public/images/           # Slike proizvoda i kategorija (placeholder SVG-ovi)
├── src/
│   ├── app/                 # Next.js App Router stranice
│   │   ├── layout.tsx       # Root layout s Headerom i Footerom
│   │   ├── page.tsx         # Homepage
│   │   ├── proizvodi/       # Katalog proizvoda
│   │   ├── proizvodi/[slug]/ # Detalji proizvoda
│   │   ├── kategorije/[slug]/ # Pregled kategorije
│   │   ├── kosarica/        # Košarica
│   │   ├── checkout/        # Checkout i potvrda narudžbe
│   │   ├── o-nama/          # Stranica o tvrtki
│   │   └── kontakt/         # Kontakt forma i podaci
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── home/            # Hero, kategorije, popularni proizvodi, prednosti, CTA
│   │   ├── products/        # Kartice, grid, filteri
│   │   ├── product/         # Galerija, gumb dodaj u košaricu, srodni proizvodi
│   │   ├── cart/            # Košarica, popis artikala, quantity selector
│   │   ├── checkout/        # Checkout forma
│   │   └── ui/              # Reusable UI komponente
│   ├── data/                # JSON datoteke
│   ├── hooks/               # GSAP hookovi
│   ├── lib/                 # Utility funkcije
│   ├── store/               # Zustand košarica
│   └── types/               # TypeScript tipovi
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## Glavne funkcionalnosti

- ✅ Homepage s hero sekcijom, kategorijama, popularnim proizvodima i prednostima
- ✅ Katalog s pretragom, filterom po kategoriji, filterom po brendu, sortiranjem i paginacijom
- ✅ Stranica proizvoda s galerijom, specifikacijama i košaricom
- ✅ Pregled kategorije s filtriranim proizvodima
- ✅ Košarica s dodavanjem, uklanjanjem, promjenom količine i trajnim spremanjem
- ✅ Checkout forma s validacijom i potvrdom narudžbe
- ✅ O nama i Kontakt stranice
- ✅ Responzivan dizajn od mobile do desktopa
- ✅ GSAP animacije bez hydration grešaka
- ✅ Metadata i semantički HTML

## Što bi trebalo dodati za punu produkcijsku trgovinu

- **Plaćanje:** integracija sa Stripe, Monri, Corvus ili sličnim payment providerom
- **Backend za narudžbe:** API ruta ili zasebni servis za zaprimanje i obradu narudžbi
- **Email potvrde:** automatske potvrde kupcu i prodavaču (npr. Resend, SendGrid)
- **CMS/admin panel:** uređivanje proizvoda bez mijenjanja JSON datoteka
- **Baza podataka:** PostgreSQL/MongoDB za proizvode, narudžbe i korisnike
- **Autentikacija:** korisnički računi, povijest narudžbi i spremljene adrese
- **ERP integracija:** sinkronizacija zaliha, cijena i narudžbi s poslovnim sustavom
- **Fiskalizacija:** ako se primjenjuje hrvatska fiskalizacija (R1, fiskalni računi)
- **Napredna pretraga:** pretraga po specifikacijama, cjenovni raspon, dostupnost
- **Recenzije proizvoda:** ocjene i komentari kupaca
- **Višejezičnost:** hrvatski, engleski, njemački
- **Analitika:** Google Analytics 4, Meta pixel, Hotjar
- **Više slika po proizvodu:** zamjena placeholder SVG-ova pravim fotografijama

## Deployment

- **Repo:** https://github.com/dpernek/ro-tea-webshop-hermes
- **Live URL:** https://ro-tea-webshop-hermes.vercel.app

---

\*Projekt kreiran kao početna verzija RO-TEA web trgovine, spremna za daljnji razvoj i integraciju.
