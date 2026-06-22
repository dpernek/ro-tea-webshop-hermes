"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, [ref, y, duration, delay, start]);
}
