"use client";

import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PopularProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/catalog/products?limit=8")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle title="Popularni proizvodi" subtitle="Najtraženiji artikli iz naše ponude." />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <ProductGrid products={products} />
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
