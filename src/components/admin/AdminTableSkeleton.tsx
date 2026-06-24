"use client";

import { cn } from "@/lib/utils";

interface AdminTableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * AdminTableSkeleton — placeholder za tablicu tijekom učitavanja podataka.
 * - rows: broj redaka (default 5)
 * - cols: broj stupaca (default 4)
 * - pulse animacija na svim placeholder elementima
 */
export function AdminTableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: AdminTableSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white",
        className,
      )}
      role="status"
      aria-label="Učitavanje podataka…"
    >
      {/* Header row */}
      <div className="flex border-b border-slate-100 bg-slate-50 px-6 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="flex-1 animate-pulse"
          >
            <div className="h-3.5 w-2/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`r-${rowIdx}`}
          className={cn(
            "flex px-6 py-4",
            rowIdx < rows - 1 && "border-b border-slate-50",
          )}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={`c-${rowIdx}-${colIdx}`}
              className="flex-1 animate-pulse pr-4 last:pr-0"
            >
              <div
                className={cn(
                  "h-4 rounded bg-slate-200",
                  // Variraj širinu za prirodniji izgled
                  colIdx === 0
                    ? "w-5/6"
                    : colIdx === cols - 1
                      ? "w-1/2"
                      : "w-3/4",
                )}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Screen reader only */}
      <span className="sr-only">Učitavanje podataka…</span>
    </div>
  );
}
