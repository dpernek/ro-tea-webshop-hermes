"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AdminButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

/**
 * AdminButton — wrapper oko postojećeg Buttona s dodatnim admin UX stanjima.
 * - loading: prikazuje Loader2 spinner (iz Buttona) + aria-busy
 * - loadingText: zamjenjuje tekst gumba tijekom učitavanja
 * - disabled automatski kad je loading=true
 * - zadržava istu širinu gumba za vrijeme prijelaza u loading stanje
 */
export function AdminButton({
  loading = false,
  loadingText,
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: AdminButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [minWidth, setMinWidth] = useState<number | undefined>();

  // Izmjeri širinu gumba u normalnom stanju i postavi min-width
  // kako se gumb ne bi skupljao/širio prilikom prijelaza u loading
  useEffect(() => {
    if (!loading && btnRef.current && minWidth === undefined) {
      const w = btnRef.current.getBoundingClientRect().width;
      if (w > 0) setMinWidth(w);
    }
  }, [loading, minWidth]);

  return (
    <Button
      ref={btnRef}
      variant={variant}
      size={size}
      isLoading={loading}
      disabled={loading}
      aria-busy={loading}
      className={cn(className)}
      style={minWidth ? { minWidth: `${minWidth}px` } : undefined}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
