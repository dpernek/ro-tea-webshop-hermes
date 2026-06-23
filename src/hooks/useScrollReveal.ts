"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";

interface UseScrollRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options: UseScrollRevealOptions = {}
) {
  const { y = 30, duration = 0.7, delay = 0, start = "top 88%" } = options;

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If reduced motion, skip animation and set final visible state immediately
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    const initAnimation = async () => {
      // Dynamic import: client-only guard to prevent SSR/hydration issues
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          element,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start,
              toggleActions: "play none none none",
            },
          }
        );
      });
    };

    initAnimation();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [ref, y, duration, delay, start]);
}
