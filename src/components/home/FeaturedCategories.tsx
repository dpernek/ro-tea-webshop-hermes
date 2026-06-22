"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const featured = [
  { name: "Festa", slug: "festa-alati", image: "/images/categories/openai_codex_gpt-image-2-high_20260622_165747_39242876.png", count: 661 },
  { name: "Građevinski alati", slug: "gradevinski-alati", image: "/images/categories/openai_codex_gpt-image-2-high_20260622_165854_08d6d07d.png", count: 305 },
  { name: "Alati za radionice", slug: "alati-za-radionice", image: "/images/categories/openai_codex_gpt-image-2-high_20260622_170003_90dae7e9.png", count: 304 },
  { name: "Vrtni alati", slug: "vrtni-alati", image: "/images/categories/openai_codex_gpt-image-2-high_20260622_170123_564d16d3.png", count: 191 },
];

export function FeaturedCategories() {
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
            <Link href="/proizvodi" className="hidden items-center gap-1 text-sm font-medium text-[#0055a8] hover:underline sm:flex">
              Sve kategorije <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((cat, i) => (
            <AnimatedSection key={cat.slug} delay={i * 0.1}>
              <Link
                href={`/kategorije/${cat.slug}`}
                className="group relative block h-48 overflow-hidden rounded-2xl sm:h-56"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{cat.count} proizvoda</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
