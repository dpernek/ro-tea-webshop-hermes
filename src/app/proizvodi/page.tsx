"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchAndFilters, type SortOption } from "@/components/products/SearchAndFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-100 rounded-t-2xl" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-8 w-24 rounded bg-slate-100 mt-4" />
        <div className="h-10 w-full rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="animate-pulse space-y-1.5">
      <div className="h-4 w-24 rounded bg-slate-100 mb-3" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-9 w-full rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  useEffect(() => {
    const load = async () => {
      const [pRes, cRes, bRes] = await Promise.all([
        fetch("/api/catalog/products"),
        fetch("/api/catalog/categories"),
        fetch("/api/catalog/brands"),
      ]);
      setProducts(await pRes.json());
      setCategories(await cRes.json());
      setBrands(await bRes.json());
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.categorySlug === selectedCategory);
    if (selectedBrand) result = result.filter(p => p.brandId === selectedBrand);
    if (showFeaturedOnly) result = result.filter(p => p.featured);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    return result;
  }, [products, selectedCategory, selectedBrand, showFeaturedOnly, searchQuery, sortBy]);

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Katalog proizvoda</h1>
            <p className="mt-2 text-slate-600">Pronađite tehničku opremu, alate i materijale.</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              {loading ? (
                <SkeletonSidebar />
              ) : (
                <>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Kategorije</h2>
                  <nav className="space-y-0.5">
                    {categories.map(c => (
                      <button key={c.id} onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedCategory === c.id ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                        {c.name} <span className="text-xs text-slate-400">({c.count || 0})</span>
                      </button>
                    ))}
                  </nav>
                </>
              )}
            </div>
          </aside>
          <div className="min-w-0 flex-1">
            {!loading && (
              <SearchAndFilters
                categories={categories} brands={brands}
                selectedCategory={selectedCategory} selectedBrand={selectedBrand}
                showFeaturedOnly={showFeaturedOnly}
                onCategoryChange={setSelectedCategory} onBrandChange={setSelectedBrand}
                onFeaturedChange={setShowFeaturedOnly}
                searchQuery={searchQuery} onSearchChange={setSearchQuery}
                sortBy={sortBy} onSortChange={setSortBy}
                resultCount={filtered.length}
              />
            )}
            <div className="mt-6">
              {loading ? (
                <SkeletonGrid />
              ) : (
                <ProductGrid products={filtered} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
