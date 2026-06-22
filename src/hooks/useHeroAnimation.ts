"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";

interface HeroAnimationOptions {
  delay?: number;
}

export function useHeroAnimation(
  containerRef: RefObject<HTMLElement | null>,
  options: HeroAnimationOptions = {}
) {
  const { delay = 0 } = options;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-animate",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay,
        }
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef, delay]);
}
