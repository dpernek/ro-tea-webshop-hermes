"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useHeroAnimation } from "@/hooks/useHeroAnimation";
import { ArrowRight, ShieldCheck, Truck, Wrench, Pause, Play } from "lucide-react";
import { site } from "@/lib/data";

const heroImages = [
  { src: "/images/hero/hero-welder-1920w.webp", alt: "Zavarivanje - profesionalni alati" },
  { src: "/images/hero/hero-warehouse-1920w.webp", alt: "Skladište profesionalnih alata" },
  { src: "/images/hero/hero-grinding-1920w.webp", alt: "Brušenje metala - precizni alati" },
  { src: "/images/hero/hero-workshop-1920w.webp", alt: "Radionica - RO-TEA alati" },
];

const INTERVAL = 6000;
const FADE_DURATION = 1000;

const benefits = [
  { icon: Truck, label: "Brza dostava" },
  { icon: ShieldCheck, label: "Garancija kvalitete" },
  { icon: Wrench, label: "Stručna podrška" },
];

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useHeroAnimation(containerRef, { delay: 0.15 });

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Track image loads
  const onImageLoad = (i: number) => {
    setImagesLoaded((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[80vh] items-center overflow-hidden bg-slate-950"
    >
      {/* Slideshow images */}
      {heroImages.map((img, i) => {
        const isActive = i === current;
        const isFirst = i === 0;
        return (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover transition-opacity"
            style={{
              opacity: isActive ? 1 : 0,
              transitionDuration: `${FADE_DURATION}ms`,
              transitionTimingFunction: "ease-in-out",
            }}
            priority={isFirst}
            fetchPriority={isFirst ? "high" : "auto"}
            loading={isFirst ? undefined : "lazy"}
            sizes="100vw"
            quality={80}
            onLoad={() => onImageLoad(i)}
          />
        );
      })}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-3xl">
          <p className="hero-animate text-sm font-semibold tracking-[0.2em] text-[#0055a8] uppercase">
            {site.tagline}
          </p>

          <h1 className="hero-animate mt-6 text-4xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>

          <p className="hero-animate mt-6 max-w-xl text-lg leading-relaxed text-slate-200">
            Široka ponuda provjerenih proizvoda za profesionalce, obrtnike i
            industriju. Brza dostava, detaljni opisi i jednostavna kupnja —
            sve na jednom mjestu.
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
                <benefit.icon className="h-5 w-5 text-[#0055a8]" aria-hidden="true" />
                {benefit.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1">
        <div className="flex items-center">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="flex h-12 w-12 items-center justify-center"
              aria-label={`Slika ${i + 1} od ${heroImages.length}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "h-2.5 w-8 bg-[#0055a8]"
                    : "h-2.5 w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          aria-label={isPaused ? "Pokreni slideshow" : "Pauziraj slideshow"}
        >
          {isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Arrow navigation — visible on hover/focus, 48px touch targets */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-all hover:bg-white/25 hover:text-white hover:scale-105 sm:flex"
        aria-label="Prethodna slika"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-all hover:bg-white/25 hover:text-white hover:scale-105 sm:flex"
        aria-label="Sljedeća slika"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
