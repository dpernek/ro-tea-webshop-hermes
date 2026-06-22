"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { delay, duration: 0.7, y: 28 });

  return (
    <div ref={ref} className={cn("opacity-0", className)}>
      {children}
    </div>
  );
}
