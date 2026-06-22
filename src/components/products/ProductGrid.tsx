"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  pageSize?: number;
}

export function ProductGrid({ products, pageSize = 24 }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  if (products.length === 0) {
    return (
      <EmptyState
        title="Nema pronađenih proizvoda"
        description="Pokušajte promijeniti filtere ili pretražiti drugačiji pojam."
        action={
          <Button asChild variant="outline">
            <Link href="/proizvodi">Prikaži sve proizvode</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
          >
            Učitaj više ({Math.min(pageSize, products.length - visibleCount)}{" "}
            proizvoda)
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Prikazano {visibleProducts.length} od {products.length} proizvoda
      </p>
    </div>
  );
}
