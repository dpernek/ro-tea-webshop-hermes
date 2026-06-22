"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Product, Category } from "@/types";
import { ChevronDown, ChevronLeft, ChevronRight, Grid3X3, X } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
  currentCategory?: Category;
}

const MAX_VISIBLE = 100;

/** Extract a category identifier from a product for matching.
 *  API products have categoryId, JSON products have categorySlug. */
function getCategoryKey(product: Product & Record<string, unknown>): string | undefined {
  return (product.categorySlug as string) || (product.categoryId as string);
}

export function ProductGrid({
  products,
  categories,
  currentCategory,
}: ProductGridProps) {
  const initialCategory = currentCategory?.slug ?? null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ---- filtering ----
  const filtered = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => {
      // try categorySlug first (JSON data), then categoryId (API/Prisma)
      const key = getCategoryKey(p as Product & Record<string, unknown>);
      if (!key) return false;
      // match against slug or id
      return (
        key === selectedCategory ||
        p.categorySlug === selectedCategory
      );
    });
  }, [products, selectedCategory]);

  // ---- sorting ----
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-desc":
          return b.name.localeCompare(a.name);
        default: // name-asc
          return a.name.localeCompare(b.name);
      }
    });
  }, [filtered, sortBy]);

  // ---- pagination ----
  const totalPages = Math.ceil(sorted.length / MAX_VISIBLE);
  const needsPagination = sorted.length > MAX_VISIBLE;
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedProducts = needsPagination
    ? sorted.slice((safePage - 1) * MAX_VISIBLE, safePage * MAX_VISIBLE)
    : sorted;

  // ---- category counts (computed from products) ----
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      const key = getCategoryKey(p as Product & Record<string, unknown>);
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  // ---- event handlers ----
  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    setMobileFilterOpen(false);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // derive a display count for a category: prefer live count, fall back to cat.count
  const displayCount = (cat: Category): number => {
    const live = categoryCounts[cat.slug] ?? categoryCounts[cat.id];
    return live ?? cat.count;
  };

  // ---- render ----
  return (
    <div className="flex gap-8">
      {/* ======== SIDEBAR ======== */}
      {categories && categories.length > 0 && (
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Kategorije
            </h3>
            <nav className="space-y-0.5">
              {/* "All categories" button */}
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Sve kategorije</span>
                <span className="ml-2 shrink-0 text-xs text-slate-400">
                  ({products.length})
                </span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    ({displayCount(cat)})
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* ======== MAIN CONTENT ======== */}
      <div className="min-w-0 flex-1">
        {/* ---- Top bar: count + controls ---- */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {sorted.length} proizvoda
            {selectedCategory && (
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className="ml-2 inline-flex items-center gap-1 text-xs text-[#0055a8] hover:underline"
              >
                <X className="h-3 w-3" />
                Očisti filter
              </button>
            )}
          </p>

          <div className="flex items-center gap-2">
            {/* Mobile category toggle */}
            {categories && categories.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <Grid3X3 className="mr-1 h-4 w-4" />
                Kategorije
                <ChevronDown
                  className={`ml-1 h-3 w-3 transition-transform ${
                    mobileFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0055a8] focus:outline-none focus:ring-1 focus:ring-[#0055a8]"
            >
              <option value="name-asc">Naziv: A-Z</option>
              <option value="name-desc">Naziv: Z-A</option>
              <option value="price-asc">Cijena: od najniže</option>
              <option value="price-desc">Cijena: od najviše</option>
            </select>
          </div>
        </div>

        {/* ---- Mobile category panel ---- */}
        {mobileFilterOpen && categories && categories.length > 0 && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Kategorije</h4>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-0.5">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  !selectedCategory
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sve kategorije ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    ({displayCount(cat)})
                  </span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* ---- Product grid ---- */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ---- Pagination ---- */}
            {needsPagination && totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-1.5"
                aria-label="Paginacija"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Prethodna stranica"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
                  page === "ellipsis" ? (
                    <span
                      key={`dots-${idx}`}
                      className="px-2 text-sm text-slate-400 select-none"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="min-w-[40px]"
                      aria-label={`Stranica ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  aria-label="Sljedeća stranica"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title="Nema proizvoda"
            description="U ovoj kategoriji trenutno nema proizvoda."
            action={
              <Button asChild variant="outline">
                <a href="/proizvodi">Svi proizvodi</a>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

// ---- Helper: generate page numbers with ellipsis ----
function generatePageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}
