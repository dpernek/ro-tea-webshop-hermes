import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { RecentlyViewedBlock } from "@/components/product/RecentlyViewedBlock";
import { ProductTracker } from "@/components/product/ProductTracker";
import { VariableProductOptions } from "@/components/product/VariableProductOptions";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ReadMore } from "@/components/ui/ReadMore";
import specsData from "@/data/product-specs.json";

const SPECS_MAP = specsData as Record<string, Record<string, string>>;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    select: { id: true, name: true, slug: true, price: true, salePrice: true, regularPrice: true, description: true, image: true, images: true, status: true, stockStatus: true, stock: true, brand: true, category: true, sku: true, ean: true, specifications: true, benefits: true, usage: true, warranty: true, deliveryNote: true, badge: true },
 where: { slug }, select: { name: true, shortDescription: true, image: true } });
  if (!product) return { title: "Proizvod nije pronađen | RO-TEA" };
  return {
    title: `${product.name} | RO-TEA`,
    description: product.shortDescription || product.name,
    alternates: {
      canonical: `/proizvodi/${slug}`,
    },
    openGraph: {
      title: `${product.name} | RO-TEA`,
      description: product.shortDescription || product.name,
      images: product.image ? [product.image] : [],
      type: "website",
    },
  };
}

// --- Stock status mapping (Croatian) ---
const STOCK_STATUS: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  INSTOCK: {
    label: "Dostupno",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
  },
  OUTOFSTOCK: {
    label: "Nema na zalihi",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
  ONBACKORDER: {
    label: "Po narudžbi",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
};

const FALLBACK_STOCK = {
  label: "Dostupno",
  dot: "bg-emerald-500",
  badge: "bg-emerald-50 text-emerald-700",
};

// --- Helpers ---
function getStockInfo(stockStatus: string) {
  return STOCK_STATUS[stockStatus] ?? FALLBACK_STOCK;
}

function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseBenefitsArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
    return [];
  } catch {
    return [];
  }
}


export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    select: { id: true, name: true, slug: true, price: true, salePrice: true, regularPrice: true, description: true, image: true, images: true, status: true, stockStatus: true, stock: true, brand: true, category: true, sku: true, ean: true, specifications: true, benefits: true, usage: true, warranty: true, deliveryNote: true, badge: true },

    where: { slug },
    select: {
      id: true, slug: true, name: true, sku: true,
      price: true, regularPrice: true, salePrice: true, taxRate: true,
      image: true, gallery: true, featured: true, badge: true, type: true,
      shortDescription: true, description: true, specifications: true,
      benefits: true, usage: true, warranty: true, deliveryNote: true,
      categories: true, priceRangeMin: true, priceRangeMax: true,
      stock: true, stockStatus: true, status: true,
      weight: true, width: true, height: true, depth: true,
      metaTitle: true, metaDescription: true,
      categoryId: true, brandId: true,
      brand: { select: { id: true, slug: true, name: true, image: true } },
      category: { select: { id: true, slug: true, name: true, description: true, image: true } },
    },
  });

  if (!product || product.status !== "ACTIVE") notFound();

  const relatedSelect = { id: true, slug: true, name: true, price: true, salePrice: true, image: true, categoryId: true, brandId: true, status: true } as const;

  // --- Related products (same category, exclude current) ---
  // Related products: same brand + category > same category > featured/dostupni
  let relatedProducts: any[] = [];
  if (product.categoryId && product.brandId) {
    relatedProducts = await db.product.findMany({
      where: { categoryId: product.categoryId, brandId: product.brandId, id: { not: product.id }, status: "ACTIVE" },
      orderBy: [{ featured: "desc" }, { salePrice: "asc" }, { createdAt: "desc" }],
      select: relatedSelect,
      take: 4,
    });
  }
  if (relatedProducts.length < 4 && product.categoryId) {
    const existing = new Set(relatedProducts.map(p => p.id));
    existing.add(product.id);
    const more = await db.product.findMany({
      where: { categoryId: product.categoryId, status: "ACTIVE", id: { notIn: Array.from(existing) } },
      orderBy: [{ featured: "desc" }, { salePrice: "asc" }, { createdAt: "desc" }],
      select: relatedSelect,
      take: 4 - relatedProducts.length,
    });
    relatedProducts = [...relatedProducts, ...more];
  }
  if (relatedProducts.length < 4) {
    const existing = new Set(relatedProducts.map(p => p.id));
    existing.add(product.id);
    // Prefer featured + instock first, then featured + active as last resort
    const more = await db.product.findMany({
      where: { status: "ACTIVE", featured: true, stockStatus: "INSTOCK", id: { notIn: Array.from(existing) } },
      orderBy: [{ createdAt: "desc" }],
      select: relatedSelect,
      take: 4 - relatedProducts.length,
    });
    relatedProducts = [...relatedProducts, ...more];
  }
  if (relatedProducts.length < 4) {
    const existing = new Set(relatedProducts.map(p => p.id));
    existing.add(product.id);
    const more = await db.product.findMany({
      where: { status: "ACTIVE", featured: true, id: { notIn: Array.from(existing) } },
      orderBy: [{ createdAt: "desc" }],
      select: relatedSelect,
      take: 4 - relatedProducts.length,
    });
    relatedProducts = [...relatedProducts, ...more];
  }

  // --- Derived data ---
  const galleryImages: string[] = [
    product.image,
    ...(parseJsonArray(product.gallery) as string[]),
  ].filter(Boolean);

  const categoryList = parseJsonArray(product.categories) as {
    slug: string;
    name: string;
  }[];
  const primaryCategory = product.category ?? categoryList[0] ?? null;

  const stockInfo = getStockInfo(product.stockStatus);

  const displaySpecs = SPECS_MAP[slug] || {};

  const productBenefits = parseBenefitsArray(product.benefits);

  // Price logic: prefer salePrice, then regular price vs. price
  const effectivePrice =
    product.salePrice != null ? product.salePrice : product.price;
  const oldPrice =
    product.salePrice != null && product.salePrice < product.price
      ? product.price
      : product.regularPrice && product.regularPrice > product.price
        ? product.regularPrice
        : null;
  const hasDiscount = oldPrice !== null;
  const discountPercent =
    hasDiscount && product.price > 0
      ? Math.round((1 - effectivePrice / product.price) * 100)
      : 0;

  // --- Structured data (JSON-LD) ---
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: product.image || undefined,
    sku: product.sku || undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    category: primaryCategory?.name || undefined,
    offers: {
      "@type": "Offer",
      price: effectivePrice,
      priceCurrency: "EUR",
      availability: `https://schema.org/${
        product.stockStatus === "INSTOCK"
          ? "InStock"
          : product.stockStatus === "OUTOFSTOCK"
            ? "OutOfStock"
            : product.stockStatus === "ONBACKORDER"
              ? "BackOrder"
              : "InStock"
      }`,
      url: `${siteUrl}/proizvodi/${product.slug}`,
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0],
    },
  };

  return (
    <div className="bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ===== Breadcrumb ===== */}
        <nav
          aria-label="Putanja"
          className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500"
        >
          <Link
            href="/"
            className="transition-colors hover:text-[#0055a8]"
          >
            Početna
          </Link>
          <ChevronIcon />
          <Link
            href="/proizvodi"
            className="transition-colors hover:text-[#0055a8]"
          >
            Trgovina
          </Link>
          {primaryCategory && (
            <>
              <ChevronIcon />
              <Link
                href={`/kategorije/${primaryCategory.slug}`}
                className="transition-colors hover:text-[#0055a8]"
              >
                {primaryCategory.name}
              </Link>
            </>
          )}
          <ChevronIcon />
          <span className="max-w-[240px] truncate font-medium text-slate-900">
            {product.name}
          </span>
        </nav>

        {/* ===== Main 2-column layout ===== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
          {/* ---- Left: Gallery (60 %) — capped at 500 px so the
              aspect‑square image never exceeds 500 px height */}
          <div className="mx-auto w-full max-w-[500px]">
            <ProductGallery images={galleryImages} alt={product.name} />
          </div>

          {/* ---- Right: Info (40 %) ---- */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {product.featured && (
                <Badge variant="accent">🌟 Istaknuto</Badge>
              )}
              {product.badge && (
                <Badge variant="accent">{product.badge}</Badge>
              )}
              {product.brand && (
                <Badge variant="secondary" className="gap-1">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                  </svg>
                  {product.brand.name}
                </Badge>
              )}
              {primaryCategory && (
                <Badge variant="secondary" className="gap-1">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  {primaryCategory.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* EAN */}
            {product.sku && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">EAN</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-700">{product.sku}</span>
              </div>
            )}

            {/* Stock status */}
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${stockInfo.badge}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${stockInfo.dot}`}
                />
                {stockInfo.label}
              </span>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="mt-4 leading-relaxed text-slate-600">
                {product.shortDescription}
              </p>
            )}

            {/* Price */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              {product.type === "VARIABLE" &&
              product.priceRangeMin != null ? (
                <div>
                  <p className="mb-1 text-sm text-slate-500">
                    Raspon cijena
                  </p>
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {formatPrice(product.priceRangeMin)}
                    {product.priceRangeMax &&
                      product.priceRangeMax !==
                        product.priceRangeMin && (
                        <>
                          {" "}
                          – {formatPrice(product.priceRangeMax)}
                        </>
                      )}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900 sm:text-4xl">
                      {formatPrice(effectivePrice)}
                    </span>
                    {oldPrice && (
                      <span className="text-xl text-slate-400 line-through">
                        {formatPrice(oldPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && discountPercent > 0 && (
                    <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
                      –{discountPercent}%
                    </span>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Cijena s PDV-om ({product.taxRate ?? 25}%)
                  </p>
                </div>
              )}
            </div>

            {/* ===== Key Benefits ===== */}
            {productBenefits.length > 0 && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                <h3 className="mb-3 text-base font-bold text-emerald-800">
                  Ključne značajke:
                </h3>
                <ul className="space-y-1.5">
                  {productBenefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to cart / Variable options */}
            <div className="mt-8">
              {product.type === "VARIABLE" ? (
                <VariableProductOptions product={product as any} />
              ) : (
                <AddToCartButton product={product as any} />
              )}
            </div>

            {/* ===== Trust badges ===== */}
            <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <TrustBadge
                icon={<TruckIcon />}
                label="Besplatna dostava"
                sub="za narudžbe iznad 70,00 €"
              />
              <TrustBadge
                icon={<ShieldIcon />}
                label="Sigurno plaćanje"
                sub="SSL enkripcija i zaštita"
              />
              <TrustBadge
                icon={<ReturnIcon />}
                label="Povrat 14 dana"
                sub="Bez postavljanja pitanja"
              />
              <TrustBadge
                icon={<WarrantyIcon />}
                label="Originalno jamstvo"
                sub="Jamstvo proizvođača"
              />
            </div>

            {/* Meta info */}
            <div className="mt-8 space-y-2.5 border-t border-slate-100 pt-6 text-sm text-slate-500">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                  </svg>
                  <span>
                    Brend:{" "}
                    <span className="text-slate-700">{product.brand.name}</span>
                  </span>
                </div>
              )}
              {primaryCategory && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span>
                    Kategorija:{" "}
                    <Link
                      href={`/kategorije/${primaryCategory.slug}`}
                      className="font-medium text-slate-700 underline underline-offset-2 hover:text-[#0055a8]"
                    >
                      {primaryCategory.name}
                    </Link>
                  </span>
                </div>
              )}
              {product.weight != null && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                    <polyline points="2.32,6.16 12,11 21.68,6.16" />
                    <line x1="12" y1="22.76" x2="12" y2="11" />
                  </svg>
                  <span>Težina: {product.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Full-width Description ===== */}
        {product.description && (
          <div className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Opis proizvoda
            </h2>
            <div className="mt-6 leading-relaxed text-slate-600">
              <ReadMore text={product.description} maxLines={3} />
            </div>
          </div>
        )}

        {/* ===== Why buy from us ===== */}
        <div className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Zašto kupiti kod nas
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Brza dostava</p>
                <p className="mt-1 text-sm text-slate-500">
                  Isporuka unutar 1-3 radna dana na području cijele Hrvatske.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Sigurna kupnja</p>
                <p className="mt-1 text-sm text-slate-500">
                  SSL enkripcija i sigurno plaćanje karticama, virmanom ili pouzećem.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Podrška prije i poslije kupnje</p>
                <p className="mt-1 text-sm text-slate-500">
                  Stručni savjeti i podrška — stojimo vam na raspolaganju.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Specifications table ===== */}
        {Object.keys(displaySpecs).length > 0 && (
        <div className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Specifikacije
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {Object.entries(displaySpecs).map(([key, value]) => (
                  <tr key={key} className="even:bg-slate-50/50">
                    <td className="w-1/2 px-4 py-3 font-medium text-slate-700 sm:w-1/3">
                      {key}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {value || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ===== Delivery and payment info ===== */}
        <div className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Dostava i plaćanje
          </h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Dostava</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Dostava: 8,00 € | Besplatno iznad 70,00 € | Osobno preuzimanje: 0,00 €
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Plaćanje</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Kartica, virman, pouzeće
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0055a8] transition-colors hover:text-[#003d7a]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Pomoć pri odabiru?
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Related products ===== */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900">
              Srodni proizvodi
            </h2>
            <p className="mt-2 mb-6 text-sm text-slate-500">
              Izdvojili smo slične proizvode koji bi vas mogli zanimati
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/proizvodi/${rp.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100 relative">
                    <Image
                      src={rp.image || "/images/category-placeholder.svg"}
                      alt={rp.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="100px"
                    />
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-[#0055a8]">
                    {rp.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {formatPrice(
                      rp.salePrice != null ? rp.salePrice : rp.price,
                    )}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Mobile sticky CTA ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            {product.type === "VARIABLE" && product.priceRangeMin != null ? (
              <p className="text-lg font-bold text-slate-900">
                {formatPrice(product.priceRangeMin)}
                {product.priceRangeMax &&
                  product.priceRangeMax !== product.priceRangeMin &&
                  ` – ${formatPrice(product.priceRangeMax)}`}
              </p>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(effectivePrice)}
                </span>
                {oldPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            {product.type === "VARIABLE" ? (
              <VariableProductOptions product={product as any} />
            ) : (
              <AddToCartButton product={product as any} />
            )}
          </div>
        </div>
      </div>
      <RecentlyViewedBlock />
      <ProductTracker product={{ id: product.id, name: product.name, price: product.price || product.salePrice || 0, image: product.image, slug: product.slug }} />
    </div>
  );
}

/** Tiny breadcrumb chevron SVG (avoids lucide-react import in server component) */
function ChevronIcon() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/** Trust badge row */
function TrustBadge({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0055a8]/10 text-[#0055a8]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function WarrantyIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
