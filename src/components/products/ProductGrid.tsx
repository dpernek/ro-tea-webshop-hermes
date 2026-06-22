"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Product, Category } from "@/types";
import { ChevronDown, Grid3X3, List } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
  currentCategory?: Category;
  allCategories?: Category[];
}

const PAGE_SIZE = 24;

export function ProductGrid({
  products,
  categories,
  currentCategory,
  allCategories,
}: ProductGridProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState("name-asc");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const visibleProducts = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      {allCategories && (
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Kategorije
            </h3>
            <nav className="space-y-0.5">
              <a
                href="/proizvodi"
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  !currentCategory
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Sve kategorije
              </a>
              {allCategories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/kategorije/${cat.slug}`}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    currentCategory?.slug === cat.slug
                      ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-slate-400">
                    {cat.count}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{sorted.length} proizvoda</p>
          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            {allCategories && (
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              >
                <List className="mr-1 h-4 w-4" />
                Kategorije
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              <option value="name-asc">Naziv: A-Z</option>
              <option value="name-desc">Naziv: Z-A</option>
              <option value="price-asc">Cijena: od najniže</option>
              <option value="price-desc">Cijena: od najviše</option>
            </select>
          </div>
        </div>

        {/* Mobile sidebar */}
        {mobileFilterOpen && allCategories && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 lg:hidden">
            <nav className="space-y-0.5">
              <a
                href="/proizvodi"
                className="block rounded-lg px-3 py-2 text-sm"
              >
                Sve kategorije
              </a>
              {allCategories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/kategorije/${cat.slug}`}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    currentCategory?.slug === cat.slug
                      ? "bg-[#0055a8]/10 text-[#0055a8]"
                      : ""
                  }`}
                >
                  {cat.name}
                  <span className="text-xs text-slate-400">{cat.count}</span>
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Grid */}
        {visibleProducts.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  Učitaj više ({Math.min(PAGE_SIZE, sorted.length - visible)}{" "}
                  proizvoda)
                </Button>
              </div>
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
