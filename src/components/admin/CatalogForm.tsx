"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ArrowLeft } from "lucide-react";

interface CatalogData {
  id?: string; name: string; brand?: string; description?: string;
  fileUrl: string; active: boolean; sortOrder: number;
}

export function CatalogForm({ catalog }: { catalog: CatalogData | null }) {
  const router = useRouter();
  const isEdit = !!catalog;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const clearError = (f: string) => setFieldErrors(prev => { const n = { ...prev }; delete n[f]; return n; });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setFieldErrors({}); setSuccess(false);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      brand: form.get("brand") || "",
      description: form.get("description") || "",
      fileUrl: form.get("fileUrl"),
      active: form.get("active") === "on",
      sortOrder: parseInt(form.get("sortOrder") as string) || 0,
    };

    try {
      const url = isEdit ? `/api/admin/catalogs/${catalog!.id}` : "/api/admin/catalogs";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.errors && typeof d.errors === "object") {
          setFieldErrors(d.errors);
          setError("Ispravite označena polja.");
        } else {
          setError(d.error || `Greška ${res.status}`);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => { router.push("/admin/katalozi"); router.refresh(); }, 500);
    } catch (e: any) {
      setError(e.message || "Greška pri spremanju.");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/katalozi" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Natrag</Link>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Uredi katalog" : "Novi katalog"}</h1>
      </div>

      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Katalog spremljen!</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Naziv *</label>
              <input name="name" defaultValue={catalog?.name} required onChange={() => clearError("name")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <input name="brand" defaultValue={catalog?.brand || ""} onChange={() => clearError("brand")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.brand && <p className="mt-1 text-xs text-red-600">{fieldErrors.brand}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Opis</label>
              <input name="description" defaultValue={catalog?.description || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">URL datoteke *</label>
              <input name="fileUrl" defaultValue={catalog?.fileUrl || ""} required onChange={() => clearError("fileUrl")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.fileUrl && <p className="mt-1 text-xs text-red-600">{fieldErrors.fileUrl}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Sort</label>
              <input name="sortOrder" type="number" defaultValue={catalog?.sortOrder || 0} onChange={() => clearError("sortOrder")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.sortOrder && <p className="mt-1 text-xs text-red-600">{fieldErrors.sortOrder}</p>}
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm">
                <input name="active" type="checkbox" defaultChecked={catalog?.active !== false} /> Aktivno
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/katalozi" className="inline-flex h-11 items-center rounded-lg border-2 border-slate-200 px-6 text-slate-700 hover:border-slate-300">Odustani</Link>
          <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0055a8] px-6 text-white hover:bg-[#004080] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Spremanje..." : isEdit ? "Spremi" : "Kreiraj"}
          </button>
        </div>
      </form>
    </div>
  );
}
