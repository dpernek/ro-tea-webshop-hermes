"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Wraps content in a scroll-triggered fade-in animation.
 * Respects prefers-reduced-motion via the Tailwind `motion-reduce` variant
 * (immediately visible when reduced motion is preferred, no flash).
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { delay, duration: 0.7, y: 28 });

  return (
    <div ref={ref} className={cn("opacity-0 motion-reduce:opacity-100", className)}>
      {children}
    </div>
  );
}
