"use client";

import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-200 bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={cn(
          "flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses[size]
        )}
        aria-label="Smanji količinu"
      >
        <Minus className={iconSizes[size]} />
      </button>
      <span className="w-10 text-center text-sm font-medium text-slate-900 tabular-nums select-none">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={cn(
          "flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses[size]
        )}
        aria-label="Povećaj količinu"
      >
        <Plus className={iconSizes[size]} />
      </button>
    </div>
  );
}
