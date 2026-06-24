"use client";

import Link from "next/link";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { ArrowLeft } from "lucide-react";

export default function EditProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Natrag
        </Link>
      </div>
      <AdminAlert variant="error">
        {error.message || "Došlo je do greške pri učitavanju proizvoda."}
      </AdminAlert>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0055a8] px-5 text-sm text-white hover:bg-[#004080]"
      >
        Pokušaj ponovno
      </button>
    </div>
  );
}
