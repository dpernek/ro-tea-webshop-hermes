"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, Star, ChevronDown, X } from "lucide-react";
import type { Category, Brand } from "@/types";

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

interface SearchAndFiltersProps {
  categories: Category[];
  brands?: Brand[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  showFeaturedOnly: boolean;
  onCategoryChange: (slug: string | null) => void;
  onBrandChange: (slug: string | null) => void;
  onFeaturedChange: (value: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

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
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
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

export function SearchAndFilters({
  categories,
  brands = [],
  selectedCategory,
  selectedBrand,
  showFeaturedOnly,
  onCategoryChange,
  onBrandChange,
  onFeaturedChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
}: SearchAndFiltersProps) {
  const selectedCatName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name
    : null;
  const selectedBrandName = selectedBrand
    ? brands.find((b) => b.slug === selectedBrand)?.name
    : null;

  const hasFilters =
    selectedCategory || selectedBrand || showFeaturedOnly || searchQuery;

  return (
    <div className="space-y-4">
      {/* Top row: search + sort + count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži proizvode..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ArrowUpDown className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sortiraj proizvode"
              className="cursor-pointer border-0 bg-transparent text-slate-700 focus:outline-none"
            >
              <option value="default">Preporučeno</option>
              <option value="price-asc">Cijena: od najniže</option>
              <option value="price-desc">Cijena: od najviše</option>
              <option value="name-asc">Naziv: A-Z</option>
              <option value="name-desc">Naziv: Z-A</option>
            </select>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {resultCount} proizvoda
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => onCategoryChange(null)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                !selectedCategory
                  ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              Sve kategorije
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onCategoryChange(cat.slug)}
                className={cn(
                  "flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedCategory === cat.slug
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>{cat.name}</span>
                <span className="ml-4 text-xs text-slate-400">{cat.count}</span>
              </button>
            ))}
          </div>
        </Dropdown>

        {brands.length > 0 && (
          <Dropdown
            label={
              selectedBrandName ? `Brend: ${selectedBrandName}` : "Svi brendovi"
            }
          >
            <button
              type="button"
              onClick={() => onBrandChange(null)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                !selectedBrand
                  ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              Svi brendovi
            </button>
            {brands.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => onBrandChange(b.slug)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedBrand === b.slug
                    ? "bg-[#0055a8]/10 font-medium text-[#0055a8]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {b.name}
              </button>
            ))}
          </Dropdown>
        )}

        <button
          type="button"
          onClick={() => onFeaturedChange(!showFeaturedOnly)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
            showFeaturedOnly
              ? "border-[#0055a8] bg-[#0055a8]/10 text-[#0055a8]"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          )}
        >
          <Star className="h-4 w-4" />
          Istaknuto
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              onCategoryChange(null);
              onBrandChange(null);
              onFeaturedChange(false);
              onSearchChange("");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            Očisti
          </button>
        )}
      </div>
    </div>
  );
}
