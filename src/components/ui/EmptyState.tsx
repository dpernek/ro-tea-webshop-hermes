import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <PackageOpen className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-slate-600">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
