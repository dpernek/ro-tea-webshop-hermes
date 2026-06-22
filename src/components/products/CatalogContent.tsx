"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { loadMoreProducts } from "@/app/proizvodi/actions";
import type { Product, Category, Brand } from "@/types";
import {
  Search,
  ChevronDown,
  X,
  Grid3X3,
  ArrowUpDown,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────

const PAGE_SIZE = 24;

// ── props ──────────────────────────────────────────────────────

interface CatalogContentProps {
  initialProducts: Product[];
  total: number;
  categories: Category[];
  brands: Brand[];
}

// ── dropdown helper ────────────────────────────────────────────

function Dropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────

export function CatalogContent({
  initialProducts,
  total: serverTotal,
  categories,
  brands,
}: CatalogContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // read current values from URL
  const q = searchParams.get("q") || "";
  const cat = searchParams.get("cat") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "name-asc";

  // local state
  const [loadedProducts, setLoadedProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(serverTotal);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAllCat, setShowAllCat] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // reset toggles when filter panel closes
  const closeMobileFilter = () => {
    setMobileFilterOpen(false);
    setShowAllCat(false);
    setShowAllBrands(false);
  };

  // when initialProducts changes (URL-driven server re‑fetch), reset
  useEffect(() => {
    setLoadedProducts(initialProducts);
    setTotal(serverTotal);
  }, [initialProducts, serverTotal]);

  // ── URL updaters ──────────────────────────────────────────

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }
      router.push(`/proizvodi?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => updateUrl({ q: value || null }),
    [updateUrl],
  );
  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      updateUrl({ cat: slug });
      closeMobileFilter();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateUrl],
  );
  const handleBrandChange = useCallback(
    (slug: string | null) => updateUrl({ brand: slug }),
    [updateUrl],
  );
  const handleSortChange = useCallback(
    (value: string) => updateUrl({ sort: value }),
    [updateUrl],
  );
  const handleClear = useCallback(
    () => router.push("/proizvodi", { scroll: false }),
    [router],
  );

  // ── load more ─────────────────────────────────────────────

  const hasMore = loadedProducts.length < total;
  const remaining = total - loadedProducts.length;

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const result = await loadMoreProducts({
        search: q || undefined,
        categorySlug: cat || undefined,
        brandSlug: brand || undefined,
        sort,
        skip: loadedProducts.length,
        take: PAGE_SIZE,
      });
      setLoadedProducts(result.products);
      setTotal(result.total);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [q, cat, brand, sort, loadedProducts.length]);

  // ── computed ──────────────────────────────────────────────

  const selectedCatName = cat
    ? categories.find((c) => c.slug === cat)?.name ?? cat
    : null;
  const selectedBrandName = brand
    ? brands.find((b) => b.slug === brand)?.name ?? brand
    : null;
  const hasFilters = !!(q || cat || brand);

  // ── debounced search ──────────────────────────────────────

  const [searchInput, setSearchInput] = useState(q);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // sync input when URL changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  // ── render ────────────────────────────────────────────────

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Katalog proizvoda
            </h1>
            <p className="mt-2 text-slate-600">{total} proizvoda</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Search bar (always visible, full width on mobile) ── */}
        <div className="relative mb-4 w-full lg:mb-6">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži proizvode po imenu ili šifri..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                handleSearch("");
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar — categories only (desktop) ── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">
                Kategorije
              </h3>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    !cat
                      ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Sve kategorije</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    ({total})
                  </span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => handleCategoryChange(c.slug)}
                    className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      cat === c.slug
                        ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-slate-400">
                      ({c.count})
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1">
            {/* Toolbar: filter buttons + sort + count */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <Grid3X3 className="mr-1 h-4 w-4" /> Filteri
                  <ChevronDown
                    className={`ml-1 h-3 w-3 transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                {/* Category dropdown */}
                <Dropdown
                  label={
                    selectedCatName
                      ? `Kategorija: ${selectedCatName}`
                      : "Sve kategorije"
                  }
                >
                  <div className="max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(null)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        !cat
                          ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Sve kategorije
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => handleCategoryChange(c.slug)}
                        className={`flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          cat === c.slug
                            ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="ml-4 text-xs text-slate-400">
                          {c.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </Dropdown>

                {/* Brand dropdown */}
                {brands.length > 0 && (
                  <Dropdown
                    label={
                      selectedBrandName
                        ? `Brend: ${selectedBrandName}`
                        : "Svi brendovi"
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleBrandChange(null)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        !brand
                          ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Svi brendovi
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => handleBrandChange(b.slug)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          brand === b.slug
                            ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </Dropdown>
                )}

                {/* Clear all */}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                    Očisti
                  </button>
                )}
              </div>

              {/* Sort + count */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ArrowUpDown className="h-4 w-4" />
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sortiraj proizvode"
                    className="cursor-pointer border-0 bg-transparent text-slate-700 focus:outline-none"
                  >
                    <option value="name-asc">Naziv: A-Z</option>
                    <option value="name-desc">Naziv: Z-A</option>
                    <option value="price-asc">Cijena: od najniže</option>
                    <option value="price-desc">Cijena: od najviše</option>
                  </select>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {total} proizvoda
                </span>
              </div>
            </div>

            {/* Mobile filter panel */}
            {mobileFilterOpen && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Filteri
                  </h4>
                  <button
                    type="button"
                    onClick={closeMobileFilter}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Categories in mobile panel */}
                  <div>
                    <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                      Kategorije
                    </h5>
                    <nav className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                          !cat
                            ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Sve kategorije ({total})
                      </button>
                      {(showAllCat ? categories : categories.slice(0, 6)).map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => handleCategoryChange(c.slug)}
                          className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            cat === c.slug
                              ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="ml-2 shrink-0 text-xs text-slate-400">
                            ({c.count})
                          </span>
                        </button>
                      ))}
                    </nav>
                    {categories.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCat(!showAllCat)}
                        className="mt-1 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-[#0055a8] transition-colors hover:bg-[#0055a8]/5"
                      >
                        {showAllCat
                          ? "Prikaži manje"
                          : `Prikaži sve (${categories.length})`}
                      </button>
                    )}
                  </div>
                  {/* Brands in mobile panel */}
                  {brands.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-xs font-semibold uppercase text-slate-500">
                        Brendovi
                      </h5>
                      <nav className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleBrandChange(null)}
                          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                            !brand
                              ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Svi brendovi
                        </button>
                        {(!showAllBrands ? brands.slice(0, 6) : brands).map((b) => (
                          <button
                            key={b.slug}
                            type="button"
                            onClick={() => handleBrandChange(b.slug)}
                            className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                              brand === b.slug
                                ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </nav>
                    {brands.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setShowAllBrands(!showAllBrands)}
                        className="mt-1 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-[#0055a8] transition-colors hover:bg-[#0055a8]/5"
                      >
                        {showAllBrands
                          ? "Prikaži manje"
                          : `Prikaži sve (${brands.length})`}
                      </button>
                    )}
                  </div>
                  )}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClear();
                        closeMobileFilter();
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Očisti sve filtere
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Products grid */}
            {loadedProducts.length > 0 ? (
              <>
                <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {loadedProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      isLoading={loadingMore}
                    >
                      Učitaj dodatnih {Math.min(PAGE_SIZE, remaining)} ({remaining}{" "}
                      preostalo)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="Nema proizvoda"
                description="Nijedan proizvod ne odgovara odabranim filterima."
                action={
                  <Button asChild variant="outline">
                    <a href="/proizvodi">Svi proizvodi</a>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
