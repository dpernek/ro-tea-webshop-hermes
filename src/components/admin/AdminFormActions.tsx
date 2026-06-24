"use client";

import Link from "next/link";
import { AdminButton } from "@/components/admin/AdminButton";
import { cn } from "@/lib/utils";

interface AdminFormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  cancelHref: string;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * AdminFormActions — konzistentne akcijske tipke za admin forme.
 * - submitLabel: tekst na gumbu za slanje (default: "Spremi")
 * - cancelLabel: tekst na gumbu za odustajanje (default: "Odustani")
 * - cancelHref: link na koji vodi Odustani (obavezno)
 * - isSubmitting: prikazuje loading stanje na gumbu za slanje
 *
 * Gumbi su poravnati desno (flex justify-end) s razmakom od 12px.
 */
export function AdminFormActions({
  submitLabel = "Spremi",
  cancelLabel = "Odustani",
  cancelHref,
  isSubmitting = false,
  className,
}: AdminFormActionsProps) {
  return (
    <div className={cn("flex justify-end gap-3", className)}>
      <Link
        href={cancelHref}
        className="inline-flex h-11 items-center rounded-lg border-2 border-slate-200 px-6 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
      >
        {cancelLabel}
      </Link>
      <AdminButton
        type="submit"
        loading={isSubmitting}
        loadingText="Spremanje…"
      >
        {submitLabel}
      </AdminButton>
    </div>
  );
}
