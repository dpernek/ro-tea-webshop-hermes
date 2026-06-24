"use client";

import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AlertVariant = "success" | "error" | "info" | "warning";

interface AdminAlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const iconMap: Record<AlertVariant, typeof AlertCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const colorMap: Record<AlertVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800 [&_svg]:text-green-600",
  error: "border-red-200 bg-red-50 text-red-800 [&_svg]:text-red-600",
  info: "border-blue-200 bg-blue-50 text-blue-800 [&_svg]:text-[#0055a8]",
  warning: "border-amber-200 bg-amber-50 text-amber-800 [&_svg]:text-amber-600",
};

/**
 * AdminAlert — inline obavijest za feedback stanja u admin sučelju.
 * - variant: "success" | "error" | "info" | "warning"
 * - automatski prikazuje odgovarajuću ikonu
 * - boje: zelena / crvena / plava / žuta
 */
export function AdminAlert({ variant = "error", children, className }: AdminAlertProps) {
  const Icon = iconMap[variant];

  return (
    <div
      role="alert"
      className={cn(
        "mb-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        colorMap[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
