"use client";

import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import type { Category } from "@/types";

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

interface SearchAndFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

export function SearchAndFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
}: SearchAndFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži proizvode..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus:border-brand focus:ring-brand/20 h-11 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent text-sm text-slate-700 focus:outline-none"
            >
              <option value="default">Sortiraj</option>
              <option value="price-asc">Cijena: od najniže</option>
              <option value="price-desc">Cijena: od najviše</option>
              <option value="name-asc">Naziv: A-Z</option>
              <option value="name-desc">Naziv: Z-A</option>
            </select>
          </div>
          <span className="text-sm text-slate-500">
            {resultCount} {resultCount === 1 ? "proizvod" : "proizvoda"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-brand text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          )}
        >
          Sve
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === category.slug
                ? "bg-brand text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
