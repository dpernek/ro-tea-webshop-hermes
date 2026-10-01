"use client";

import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function PopularProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog/products?home=true")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const hasFeatured = products.some((p) => p.featured);

  const title =
    hasFeatured ? "Istaknuti proizvodi" : "Popularni proizvodi";
  const subtitle =
    hasFeatured
      ? "Odabrani artikli iz naše ponude."
      : "Najtraženiji artikli iz naše ponude.";

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title={loading ? "Popularni proizvodi" : title}
            subtitle={loading ? "Najtraženiji artikli iz naše ponude." : subtitle}
          />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white p-4">
                  <div className="aspect-square w-full rounded-lg bg-slate-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </AnimatedSection>
        <AnimatedSection delay={0.2} className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/proizvodi">Pogledaj sve proizvode</Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
