"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { products } from "@/lib/data";

export function PopularProducts() {
  const popular = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Popularni proizvodi"
            subtitle="Najtraženiji artikli iz naše ponude."
          />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <ProductGrid products={popular} />
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
