"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Product, Category } from "@/types";
import { ChevronDown, Grid3X3, X } from "lucide-react";

const PAGE_SIZE = 24;

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
  currentCategory?: Category;
}

function getCategoryKey(product: Product & Record<string, unknown>): string | undefined {
  return (product.categorySlug as string) || (product.categoryId as string);
}

export function ProductGrid({ products, categories, currentCategory }: ProductGridProps) {
  const initialCategory = currentCategory?.slug ?? null;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sortBy, setSortBy] = useState("name-asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // filtering
  const filtered = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => {
      const key = getCategoryKey(p as Product & Record<string, unknown>);
      return key === selectedCategory || p.categorySlug === selectedCategory;
    });
  }, [products, selectedCategory]);

  // sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-desc": return b.name.localeCompare(a.name);
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [filtered, sortBy]);

  const visibleProducts = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;
  const remaining = sorted.length - visibleCount;

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setVisibleCount(PAGE_SIZE);
    setMobileFilterOpen(false);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setVisibleCount(PAGE_SIZE);
  };

  const loadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  const displayCount = (cat: Category): number => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      const key = getCategoryKey(p as Product & Record<string, unknown>);
      if (key) counts[key] = (counts[key] || 0) + 1;
    }
    const live = counts[cat.slug] ?? counts[cat.id];
    return live ?? cat.count;
  };

  return (
    <div className="flex gap-8">
      {/* SIDEBAR */}
      {categories && categories.length > 0 && (
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">Kategorije</h3>
            <nav className="space-y-0.5">
              <button type="button" onClick={() => handleCategorySelect(null)}
                className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${!selectedCategory ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                <span>Sve kategorije</span>
                <span className="ml-2 shrink-0 text-xs text-slate-400">({products.length})</span>
              </button>
              {categories.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedCategory === cat.slug ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">({displayCount(cat)})</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {sorted.length} proizvoda
            {selectedCategory && (
              <button type="button" onClick={() => handleCategorySelect(null)}
                className="ml-2 inline-flex items-center gap-1 text-xs text-[#0055a8] hover:underline">
                <X className="h-3 w-3" /> Očisti filter
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            {categories && categories.length > 0 && (
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
                <Grid3X3 className="mr-1 h-4 w-4" /> Kategorije
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
              </Button>
            )}
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0055a8] focus:outline-none focus:ring-1 focus:ring-[#0055a8]">
              <option value="name-asc">Naziv: A-Z</option>
              <option value="name-desc">Naziv: Z-A</option>
              <option value="price-asc">Cijena: od najniže</option>
              <option value="price-desc">Cijena: od najviše</option>
            </select>
          </div>
        </div>

        {/* Mobile filter panel */}
        {mobileFilterOpen && categories && categories.length > 0 && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Kategorije</h4>
              <button type="button" onClick={() => setMobileFilterOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <nav className="space-y-0.5">
              <button type="button" onClick={() => handleCategorySelect(null)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${!selectedCategory ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                Sve kategorije ({products.length})
              </button>
              {categories.map((cat) => (
                <button key={cat.slug} type="button" onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedCategory === cat.slug ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">({displayCount(cat)})</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Products grid */}
        {visibleProducts.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" onClick={loadMore}>
                  Učitaj dodatnih {Math.min(PAGE_SIZE, remaining)} ({remaining} preostalo)
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="Nema proizvoda" description="U ovoj kategoriji trenutno nema proizvoda."
            action={<Button asChild variant="outline"><a href="/proizvodi">Svi proizvodi</a></Button>} />
        )}
      </div>
    </div>
  );
}
