"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export function FeaturedCategories() {
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/catalog/categories")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const withProducts = data.filter((c: any) => c.count > 0).sort((a: any, b: any) => b.count - a.count);
        setCats(withProducts);
      });
  }, []);

  const fallback = "/images/categories/elektricni-alat.png";

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Kategorije proizvoda
              </h2>
              <p className="mt-3 text-lg text-slate-500">
                Pronađite opremu prema svojim potrebama
              </p>
            </div>
            <Link href="/proizvodi" className="hidden items-center gap-1.5 text-sm font-medium text-[#0055a8] transition-colors hover:text-[#0070cc] sm:flex">
              Sve kategorije <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cats.slice(0, 4).map((cat, i) => (
            <AnimatedSection key={cat.id} delay={i * 0.1}>
              <Link
                href={`/kategorije/${cat.slug}`}
                className="group relative flex h-52 flex-col justify-end overflow-hidden rounded-2xl sm:h-60"
              >
                <Image
                  src={cat.image || fallback}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent transition-opacity group-hover:from-slate-900/90" />
                {/* Content */}
                <div className="relative z-10 p-5">
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200">
                    <span>{cat.count} proizvoda</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile link */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/proizvodi" className="inline-flex items-center gap-1.5 rounded-lg border border-[#0055a8]/20 bg-[#0055a8]/5 px-4 py-2.5 text-sm font-medium text-[#0055a8] transition-colors hover:bg-[#0055a8]/10">
            Sve kategorije <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
