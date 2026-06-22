"use client";

import { useRef } from "react";
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

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  useHeroAnimation(containerRef, { delay: 0.15 });

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[80vh] items-center overflow-hidden bg-slate-950"
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Blue glow orbs */}
        <div className="from-brand/40 absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br to-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-800/20 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Subtle diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-3xl">
          <p className="hero-animate text-sm font-semibold tracking-[0.2em] text-[#0055a8] uppercase">
            Tehnička oprema · Alati · Pametna kuća
          </p>

          <h1 className="hero-animate mt-6 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>

          <p className="hero-animate mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
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
              className="border-slate-500 text-slate-300 hover:border-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/kontakt">Kontaktiraj nas</Link>
            </Button>
          </div>

          <div className="hero-animate mt-16 flex flex-wrap gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.label}
                className="flex items-center gap-3 text-sm font-medium text-slate-400"
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
