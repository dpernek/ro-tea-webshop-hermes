"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

interface ProductData {
  id?: string;
  name: string; slug: string; sku: string;
  price: number; regularPrice: number | null; salePrice: number | null;
  stock: number; stockStatus: string; status: string;
  featured: boolean; badge: string; type: string;
  shortDescription: string; description: string;
  image: string; brandId: string; categoryId: string;
}

function n(val: string): number | null {
  if (!val) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

export function ProductForm({ product, categories, brands }: {
  product?: ProductData | null;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const form = new FormData(e.currentTarget);
      const body: Record<string, any> = {
        name: form.get("name"),
        slug: form.get("slug"),
        price: Number(form.get("price")) || 0,
        image: form.get("image") || "/images/placeholder.svg",
        stock: Number(form.get("stock")) || 0,
        stockStatus: form.get("stockStatus"),
        status: form.get("status"),
        type: form.get("type"),
        featured: form.get("featured") === "on",
        shortDescription: form.get("shortDescription") || "",
        description: form.get("description") || "",
        brandId: form.get("brandId") || null,
        categoryId: form.get("categoryId") || null,
        sku: form.get("sku") || null,
        badge: form.get("badge") || null,
      };

      // Optional numeric fields
      const rp = n(form.get("regularPrice") as string);
      const sp = n(form.get("salePrice") as string);
      if (rp !== null) body.regularPrice = rp;
      if (sp !== null) body.salePrice = sp;

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.errors
          ? Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join("; ")
          : data.error || data.message || `Greška ${res.status}`;
        setError(errMsg);
        return;
      }

      setSuccess(true);
      setTimeout(() => { router.push("/admin/products"); router.refresh(); }, 600);
    } catch (e: any) {
      setError(e.message || "Greška pri spremanju");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Natrag
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Uredi proizvod" : "Novi proizvod"}</h1>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4" /> Proizvod spremljen!
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Osnovno</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Naziv *</label>
              <input name="name" defaultValue={product?.name} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input name="slug" defaultValue={product?.slug} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU</label>
              <input name="sku" defaultValue={product?.sku || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cijena (€) *</label>
              <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price || 0} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Redovna cijena</label>
              <input name="regularPrice" type="number" step="0.01" min="0" defaultValue={product?.regularPrice || ""} placeholder="—" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Akcijska cijena</label>
              <input name="salePrice" type="number" step="0.01" min="0" defaultValue={product?.salePrice || ""} placeholder="—" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Zaliha</label>
              <input name="stock" type="number" step="1" min="0" defaultValue={product?.stock || 0} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status zalihe</label>
              <select name="stockStatus" defaultValue={product?.stockStatus || "UNKNOWN"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="INSTOCK">Dostupno</option>
                <option value="OUTOFSTOCK">Nije dostupno</option>
                <option value="ONBACKORDER">Po narudžbi</option>
                <option value="UNKNOWN">Nepoznato</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select name="status" defaultValue={product?.status || "ACTIVE"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="DRAFT">Skica</option>
                <option value="ACTIVE">Aktivno</option>
                <option value="ARCHIVED">Arhivirano</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tip</label>
              <select name="type" defaultValue={product?.type || "SIMPLE"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="SIMPLE">Jednostavan</option>
                <option value="VARIABLE">Varijabilan</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategorija</label>
              <select name="categoryId" defaultValue={product?.categoryId || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <select name="brandId" defaultValue={product?.brandId || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">—</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input name="featured" type="checkbox" defaultChecked={product?.featured} /> Istaknuto</label>
            <input name="badge" defaultValue={product?.badge || ""} placeholder="Npr. NOVO" className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Opis</h2>
          <div><label className="mb-1 block text-sm font-medium">Kratki opis</label><textarea name="shortDescription" rows={3} defaultValue={product?.shortDescription || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="mt-3"><label className="mb-1 block text-sm font-medium">Opis</label><textarea name="description" rows={6} defaultValue={product?.description || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Slika *</h2>
          <input name="image" defaultValue={product?.image || "/images/placeholder.svg"} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products" className="inline-flex h-11 items-center rounded-lg border-2 border-slate-200 px-6 text-slate-700 hover:border-slate-300">Odustani</Link>
          <button type="submit" disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0055a8] px-6 text-white hover:bg-[#004080] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Spremanje..." : isEdit ? "Spremi" : "Kreiraj"}
          </button>
        </div>
      </form>
    </div>
  );
}
