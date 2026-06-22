import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
