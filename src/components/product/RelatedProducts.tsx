"use client";

import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export function RelatedProducts({
  products,
  title = "Srodni proizvodi",
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle title={title} />
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
