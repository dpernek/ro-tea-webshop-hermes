import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  oldPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  oldPrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl md:text-4xl",
  };

  const oldSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold tracking-tight text-slate-900",
          sizes[size]
        )}
      >
        {formatPrice(price)}
      </span>
      {oldPrice && oldPrice > price && (
        <span className={cn("text-slate-400 line-through", oldSizes[size])}>
          {formatPrice(oldPrice)}
        </span>
      )}
    </div>
  );
}
