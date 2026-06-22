"use client";

import { useState, useMemo, Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  SearchAndFilters,
  type SortOption,
} from "@/components/products/SearchAndFilters";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";

function CatalogContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name, "hr"));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name, "hr"));
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <>
      <AnimatedSection>
        <SearchAndFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredProducts.length}
        />
      </AnimatedSection>
      <AnimatedSection delay={0.1} className="mt-10">
        <ProductGrid products={filteredProducts} />
      </AnimatedSection>
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Katalog proizvoda"
            subtitle="Pronađite tehničku opremu, alate i materijale za svaku priliku."
          />
        </AnimatedSection>
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
