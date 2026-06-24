"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  ArrowUpDown,
  SlidersHorizontal,
  Filter,
  RotateCcw,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

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

// ── filter chip ────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
      <span className="max-w-[200px] truncate">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
        aria-label={`Ukloni filter ${label}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAllCat, setShowAllCat] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // reset toggles when drawer closes
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setShowAllCat(false);
    setShowAllBrands(false);
  }, []);

  // lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
    (value: string) => {
      updateUrl({ q: value || null });
    },
    [updateUrl],
  );
  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      updateUrl({ cat: slug });
      closeDrawer();
    },
    [updateUrl, closeDrawer],
  );
  const handleBrandChange = useCallback(
    (slug: string | null) => {
      updateUrl({ brand: slug });
    },
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
      setLoadedProducts(prev => [...prev, ...result.products]);
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

  // sync input when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(q);
  }, [q]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

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
                {/* Mobile filter drawer trigger button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                >
                  <SlidersHorizontal className="mr-1 h-4 w-4" />
                  Filteri
                  {hasFilters && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0055a8] text-xs font-bold text-white">
                      {(q ? 1 : 0) + (cat ? 1 : 0) + (brand ? 1 : 0)}
                    </span>
                  )}
                </Button>

                {/* Category dropdown (desktop) */}
                <div className="hidden sm:block">
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
                </div>

                {/* Brand dropdown (desktop) */}
                {brands.length > 0 && (
                  <div className="hidden sm:block">
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
                  </div>
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

            {/* ── Active filter chips ── */}
            {hasFilters && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {q && (
                  <FilterChip
                    label={`Pretraga: "${q}"`}
                    onRemove={() => {
                      setSearchInput("");
                      handleSearch("");
                    }}
                  />
                )}
                {selectedCatName && (
                  <FilterChip
                    label={selectedCatName}
                    onRemove={() => handleCategoryChange(null)}
                  />
                )}
                {selectedBrandName && (
                  <FilterChip
                    label={selectedBrandName}
                    onRemove={() => handleBrandChange(null)}
                  />
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Očisti filtere
                </button>
              </div>
            )}

            {/* ── Products grid ── */}
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
            ) : q ? (
              /* ── Empty search state ── */
              <EmptyState
                title={`Nema rezultata za "${q}"`}
                description="Pokušajte s drugim pojmom za pretragu ili pregledajte sve proizvode po kategorijama."
                action={
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" onClick={handleClear}>
                      Pregledaj sve proizvode
                    </Button>
                  </div>
                }
              />
            ) : (
              /* ── Empty filter state (no search) ── */
              <EmptyState
                title="Nema proizvoda"
                description="Nijedan proizvod ne odgovara odabranim filterima."
                action={
                  <Button asChild variant="outline">
                    <Link href="/proizvodi">Svi proizvodi</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          drawerOpen
            ? "bg-black/40 opacity-100 pointer-events-auto"
            : "bg-black/0 opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel — slides from right */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filteri"
      >
        <div className="flex h-full flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Filteri</h2>
              {hasFilters && (
                <span className="ml-1 rounded-full bg-[#0055a8] px-2 py-0.5 text-xs font-bold text-white">
                  {(q ? 1 : 0) + (cat ? 1 : 0) + (brand ? 1 : 0)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kategorije
                </h3>
                <nav className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
                  {(showAllCat ? categories : categories.slice(0, 8)).map(
                    (c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => handleCategoryChange(c.slug)}
                        className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
                    ),
                  )}
                </nav>
                {categories.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCat(!showAllCat)}
                    className="mt-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-[#0055a8] transition-colors hover:bg-[#0055a8]/5"
                  >
                    {showAllCat
                      ? "Prikaži manje"
                      : `Prikaži sve (${categories.length})`}
                  </button>
                )}
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Brendovi
                  </h3>
                  <nav className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleBrandChange(null)}
                      className={`w-full text-left flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        !brand
                          ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>Svi brendovi</span>
                    </button>
                    {(!showAllBrands
                      ? brands.slice(0, 8)
                      : brands
                    ).map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => handleBrandChange(b.slug)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          brand === b.slug
                            ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </nav>
                  {brands.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBrands(!showAllBrands)}
                      className="mt-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-[#0055a8] transition-colors hover:bg-[#0055a8]/5"
                    >
                      {showAllBrands
                        ? "Prikaži manje"
                        : `Prikaži sve (${brands.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drawer footer with actions */}
          <div className="border-t border-slate-200 px-5 py-4">
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  handleClear();
                  closeDrawer();
                }}
                className="mb-3 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
              >
                <RotateCcw className="mr-1.5 inline-block h-4 w-4" />
                Očisti filtere
              </button>
            )}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={closeDrawer}
            >
              Prikaži rezultate ({total})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
