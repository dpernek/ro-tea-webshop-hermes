"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams({ page: "1", limit: "1000" });
    const res = await fetch(`/api/catalog/products?${params}`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [cRes] = await Promise.all([fetch("/api/catalog/categories")]);
      setCategories(await cRes.json());
    };
    load();
  }, []);

  useEffect(() => {
    setLoading(true);
    loadProducts().finally(() => setLoading(false));
  }, [loadProducts]);

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Katalog proizvoda</h1>
            <p className="mt-2 text-slate-600">{loading ? "Učitavanje..." : `${total} proizvoda`}</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-slate-100 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-20 rounded-full bg-slate-100" />
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-10 w-full rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} categories={categories} />
        )}
      </div>
    </div>
  );
}
