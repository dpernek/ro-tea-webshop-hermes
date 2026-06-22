"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { ArrowRight, ShieldCheck, Truck, Wrench } from "lucide-react";
import { site } from "@/lib/data";

const benefits = [
  { icon: Truck, label: "Brza dostava" },
  { icon: ShieldCheck, label: "Garancija kvalitete" },
  { icon: Wrench, label: "Stručna podrška" },
];

interface HeroProps {
  heroImages?: string[];
}

export function Hero({ heroImages }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  useHeroAnimation(containerRef, { delay: 0.15 });

  const displayImages =
    heroImages && heroImages.length >= 4 ? heroImages.slice(0, 4) : null;

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="hero-animate text-brand text-sm font-semibold tracking-wide uppercase">
              Tehnička oprema · Alati · Pametna kuća
            </p>
            <h1 className="hero-animate mt-4 text-4xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {site.tagline}
            </h1>
            <p className="hero-animate mt-6 text-lg leading-relaxed text-slate-600">
              Široka ponuda provjerenih proizvoda za profesionalce i
              domaćinstva. Brza dostava, detaljni opisi i jednostavna kupnja —
              sve na jednom mjestu.
            </p>
            <div className="hero-animate mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/proizvodi">
                  Pregledaj ponudu
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/kontakt">Kontaktiraj nas</Link>
              </Button>
            </div>
            <div className="hero-animate mt-12 flex flex-wrap gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <benefit.icon className="text-brand h-5 w-5" />
                  {benefit.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero images grid */}
          <div className="hero-animate relative">
            {displayImages ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {displayImages.map((img, i) => (
                  <div
                    key={img}
                    className={`relative overflow-hidden rounded-2xl bg-slate-50 shadow-md transition-all duration-500 hover:shadow-lg ${
                      i === 0 ? "sm:translate-y-2" : ""
                    } ${i === 3 ? "sm:translate-y-2" : ""}`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={img}
                        alt={`RO-TEA proizvod ${i + 1}`}
                        fill
                        className="object-contain p-4 sm:p-6"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-auto aspect-square w-full max-w-lg lg:max-w-none">
                <div className="from-brand/10 absolute inset-0 rounded-full bg-gradient-to-br to-transparent" />
                <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-slate-50">
                  <div className="text-center">
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl bg-white shadow-lg">
                      <Wrench className="text-brand h-16 w-16" />
                    </div>
                    <p className="mt-6 text-lg font-medium text-slate-900">
                      RO-TEA kolekcija
                    </p>
                    <p className="mt-1 text-slate-500">
                      Profesionalni alati i oprema
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
