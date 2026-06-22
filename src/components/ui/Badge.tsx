import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "accent" | "secondary" | "info";
}

export function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps) {
  const variants = {
    default: "bg-brand text-white",
    outline: "border border-slate-200 bg-white text-slate-700",
    accent: "bg-amber-400 text-slate-900",
    secondary: "bg-slate-100 text-slate-700",
    info: "bg-sky-100 text-sky-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
