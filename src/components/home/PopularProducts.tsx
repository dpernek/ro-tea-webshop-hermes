"use client";

import { useEffect, useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PopularProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    // Fetch loaded products, then filter featured on client-side
    fetch("/api/catalog/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const all = data.products || [];
        const featured = all.filter((p: any) => p.featured);
        if (featured.length > 0) {
          setProducts(featured.slice(0, 8));
          setIsFeatured(true);
        } else {
          setProducts(all.filter((p: any) => p.price > 0).slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const title = isFeatured ? "Istaknuti proizvodi" : "Popularni proizvodi";
  const subtitle = isFeatured
    ? "Odabrani artikli iz naše ponude."
    : "Najtraženiji artikli iz naše ponude.";

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle title={title} subtitle={subtitle} />
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
