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

interface HeroProps {
  /** URL pozadinske slike. Ako nije postavljeno, koristi se gradient. */
  backgroundImage?: string;
}

export function Hero({ backgroundImage }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  useHeroAnimation(containerRef, { delay: 0.15 });

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[85vh] items-center overflow-hidden bg-slate-900"
    >
      {/* Background image or gradient overlay */}
      {backgroundImage ? (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImage}
              alt="RO-TEA hero"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 z-10 bg-slate-900/60" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        </>
      ) : (
        <>
          {/* Animated gradient background */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="from-brand/20 absolute -top-40 -right-40 z-10 h-96 w-96 rounded-full bg-gradient-to-br to-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 z-10 h-80 w-80 rounded-full bg-blue-800/10 blur-3xl" />
          {/* Subtle pattern */}
          <div
            className="absolute inset-0 z-10 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          {/* Logo */}
          <div className="hero-animate mb-8">
            <Image
              src="/images/rotea-logo.webp"
              alt="RO-TEA"
              width={260}
              height={40}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </div>

          <p className="hero-animate text-brand/80 text-sm font-semibold tracking-wide uppercase">
            Tehnička oprema · Alati · Pametna kuća
          </p>

          <h1 className="hero-animate mt-6 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>

          <p className="hero-animate mt-6 text-lg leading-relaxed text-slate-300">
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
              className="border-slate-400 text-slate-200 hover:border-white hover:bg-white/10 hover:text-white"
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
                <benefit.icon className="text-brand/80 h-5 w-5" />
                {benefit.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
