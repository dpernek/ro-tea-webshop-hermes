"use client";

import { useState, useMemo, Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  SearchAndFilters,
  type SortOption,
} from "@/components/products/SearchAndFilters";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";
import { brands } from "@/lib/data";

function CatalogContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory)
      result = result.filter((p) => p.categorySlug === selectedCategory);
    if (selectedBrand) {
      result = result.filter((p) => {
        if (!p.brand) return false;
        return p.brand.toLowerCase().replace(/\s+/g, "-") === selectedBrand;
      });
    }
    if (showFeaturedOnly) result = result.filter((p) => p.featured);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, selectedBrand, showFeaturedOnly, searchQuery]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [filteredProducts, sortBy]);

  return (
    <div className="flex gap-8">
      {/* Sidebar - kategorije */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">
            Kategorije
          </h3>
          <nav className="space-y-0.5">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedBrand(null);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                !selectedCategory
                  ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Sve kategorije
            </button>
            {categories
              .filter((c) => c.count > 0)
              .map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    {cat.count}
                  </span>
                </button>
              ))}
          </nav>

          {/* Brendovi */}
          <h3 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">
            Brendovi
          </h3>
          <nav className="space-y-0.5">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                !selectedBrand
                  ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Svi brendovi
            </button>
            {brands.map((b) => (
              <button
                key={b.slug}
                onClick={() => setSelectedBrand(b.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedBrand === b.slug
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {b.name}
              </button>
            ))}
          </nav>

          {/* Featured toggle */}
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showFeaturedOnly
                ? "bg-[#0055a8]/10 text-[#0055a8]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span
              className={showFeaturedOnly ? "text-amber-500" : "text-slate-400"}
            >
              ★
            </span>
            Istaknuti proizvodi
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <SearchAndFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          showFeaturedOnly={showFeaturedOnly}
          onCategoryChange={setSelectedCategory}
          onBrandChange={setSelectedBrand}
          onFeaturedChange={setShowFeaturedOnly}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredProducts.length}
        />

        <div className="mt-6">
          <ProductGrid products={sortedProducts} />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Katalog proizvoda
            </h1>
            <p className="mt-2 text-slate-600">
              Pronađite tehničku opremu, alate i materijale za svaku priliku.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-slate-500">
              Učitavanje...
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </div>
    </div>
  );
}
