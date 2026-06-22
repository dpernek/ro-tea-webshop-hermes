import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { VariableProductOptions } from "@/components/product/VariableProductOptions";
import { ProductGallery } from "@/components/product/ProductGallery";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Proizvod nije pronađen | RO-TEA" };
  return {
    title: `${product.name} | RO-TEA`,
    description: product.shortDescription || product.name,
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
  label: "Nepoznato",
  dot: "bg-slate-400",
  badge: "bg-slate-50 text-slate-600",
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
    },
  });

  if (!product || product.status !== "ACTIVE") notFound();

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

  return (
    <div className="bg-white">
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

            {/* SKU */}
            {product.sku && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7V4h16v3" />
                  <path d="M9 20h6" />
                  <path d="M12 4v16" />
                </svg>
                Šifra: {product.sku}
              </p>
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

            {/* Add to cart / Variable options */}
            <div className="mt-8">
              {product.type === "VARIABLE" ? (
                <VariableProductOptions product={product as any} />
              ) : (
                <AddToCartButton product={product as any} />
              )}
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
            <div className="prose prose-slate max-w-none whitespace-pre-line leading-relaxed text-slate-600">
              {product.description}
            </div>
          </div>
        )}
      </div>
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
