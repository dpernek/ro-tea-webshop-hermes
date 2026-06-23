"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { products } from "@/lib/data";

export function PopularProducts() {
  const featured = products.filter((p) => p.featured);
  const display =
    featured.length > 0
      ? featured.slice(0, 8)
      : products
          .filter((p) => p.price > 0 && p.image !== "/images/placeholder.svg")
          .slice(0, 8);

  const title =
    featured.length > 0 ? "Istaknuti proizvodi" : "Popularni proizvodi";
  const subtitle =
    featured.length > 0
      ? "Odabrani artikli iz naše ponude."
      : "Najtraženiji artikli iz naše ponude.";

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle title={title} subtitle={subtitle} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <ProductGrid products={display} />
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
