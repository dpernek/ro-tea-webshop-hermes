"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CategoryCard } from "@/components/products/CategoryCard";
import { categories } from "@/lib/data";

export function FeaturedCategories() {
  const featured = categories.slice(0, 4);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Istaknute kategorije"
            subtitle="Pronađite opremu prema svojim potrebama — od alata do pametne kuće."
          />
        </AnimatedSection>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((category, index) => (
            <AnimatedSection key={category.slug} delay={index * 0.08 + 0.1}>
              <CategoryCard category={category} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
