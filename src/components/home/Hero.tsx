"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { ArrowRight, ShieldCheck, Truck, Wrench } from "lucide-react";
import { site } from "@/lib/data";

const benefits = [
  { icon: Truck, label: "Brza dostava" },
  { icon: ShieldCheck, label: "Garancija kvalitete" },
  { icon: Wrench, label: "Stručna podrška" },
];

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  useHeroAnimation(containerRef, { delay: 0.15 });

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[80vh] items-center overflow-hidden"
    >
      {/* Background image */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-slate-950/70" />
      {/* Gradient fade for better look */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-3xl">
          <p className="hero-animate text-sm font-semibold tracking-[0.2em] text-[#0055a8] uppercase">
            Tehnička oprema · Alati · Pametna kuća
          </p>

          <h1 className="hero-animate mt-6 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>

          <p className="hero-animate mt-6 max-w-xl text-lg leading-relaxed text-slate-200">
            Široka ponuda provjerenih proizvoda za profesionalce i domaćinstva.
            Brza dostava, detaljni opisi i jednostavna kupnja — sve na jednom
            mjestu.
          </p>

          <div className="hero-animate mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/proizvodi">
                Pregledaj ponudu
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-400 text-white hover:border-white hover:bg-white/10"
            >
              <Link href="/kontakt">Kontaktiraj nas</Link>
            </Button>
          </div>

          <div className="hero-animate mt-16 flex flex-wrap gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.label}
                className="flex items-center gap-3 text-sm font-medium text-slate-300"
              >
                <benefit.icon className="h-5 w-5 text-[#0055a8]" />
                {benefit.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
