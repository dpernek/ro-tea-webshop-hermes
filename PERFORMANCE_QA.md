# PERFORMANCE QA — RO-TEA Webshop

**Date:** 2026-06-23
**Deploy:** https://ro-tea-webshop-hermes.vercel.app

---

## Commits

| Hash | Faza | Opis |
|------|------|------|
| `07e4542` | 1 | Image pipeline: remotePatterns, next/image, sizes |
| `c7f1941` | 2+5 | Upload recommendation + caching audit |
| `693fab5` | 3+4 | Reduced motion, GSAP hydration, mobile overflow |

---

## What Was Optimized

### Images
- ✅ Supabase Storage added to `remotePatterns` in next.config
- ✅ Bare `<img>` replaced with `next/image` on product detail page
- ✅ `fill` + `sizes` already configured on ProductCard
- ✅ `priority` only on Hero (above-the-fold)
- ✅ All other images lazy by default
- ✅ Formats: AVIF + WebP

### Animations (GSAP)
- ✅ `prefers-reduced-motion` respected — skips animation, shows instantly
- ✅ `ScrollTrigger` dynamically imported in `useEffect` (no SSR hydration risk)
- ✅ CSS-level `motion-reduce:opacity-100` prevents flash

### Mobile Responsive
- ✅ `overflow-x-auto` added to 5 admin tables
- ✅ Header, ProductCard, Grid, Cart, Checkout all responsive
- ✅ ProductGrid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### Admin Upload
- ✅ Recommendation text: "Preporučena veličina: 1200×1200 px, WebP ili JPG, do 5 MB."
- ✅ Block local in production

### Caching
- ✅ `noStore()` on admin dashboard
- ✅ `force-dynamic` on API routes
- ✅ Sitemap excludes ARCHIVED products
- ✅ Canonical URLs on catalog/product pages

---

## Build

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| Client chunks | 1MB (GSAP), 286KB, 227KB, 142KB |

---

## Verified Live

| Test | Result |
|------|--------|
| Images load from Supabase Storage | ✅ |
| ProductCard no layout shift | ✅ |
| GSAP animations work | ✅ |
| Reduced motion skips animations | ✅ |
| Mobile admin tables scrollable | ✅ |
| Admin upload recommendation visible | ✅ |
| Upload to Supabase works | ✅ |
| Fake success page safe | ✅ |
| `/katalozi` from DB | ✅ |

---

## Known Limits

| Item | Note |
|------|------|
| GSAP bundle (1MB) | Could be split into chunk for admin-only |
| No Lighthouse data | Not run — needs production domain for accurate scoring |
| No bundle analyzer | Can be added later if needed |
| Font optimization | Already using next/font with Inter — no changes needed |

---

## NOT TOUCHED
- Stripe flow
- Order lifecycle
- Admin auth
- Microsoft 365 email
- Supabase Storage abstraction (upload logic)
- Business logic
