"use client";

import { useRef } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { categories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FeaturedCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCategories = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Kategorije proizvoda"
            subtitle="Pronađite opremu prema svojim potrebama"
          />
        </AnimatedSection>

        <div className="relative">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute top-1/2 -left-3 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-slate-50 sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </button>

          {/* Scrollable categories */}
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeCategories.map((category, i) => (
              <AnimatedSection key={category.slug} delay={i * 0.05 + 0.1}>
                <Link
                  href={`/kategorije/${category.slug}`}
                  className="group relative flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:w-[220px]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="220px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[#0055a8]">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {category.count} proizvoda
                    </p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-lg hover:bg-slate-50 sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/proizvodi"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0055a8] hover:underline"
          >
            Sve kategorije
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
