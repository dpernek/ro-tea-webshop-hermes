"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { AdminAlert } from "@/components/admin/AdminAlert";

interface ProductData {
  id?: string;
  name: string; slug: string; sku: string;
  price: number; regularPrice: number | null; salePrice: number | null;
  stock: number; stockStatus: string; status: string;
  featured: boolean; badge: string; type: string;
  shortDescription: string; description: string;
  image: string; brandId: string; categoryId: string;
  benefits?: string; usage?: string; warranty?: string; deliveryNote?: string;
}

function n(val: string): number | null {
  if (!val) return null;
  const clean = val.replace(",", ".");
  const num = Number(clean);
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const clearError = (field: string) => setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess(false);
    setSaving(true);

    try {
      const form = new FormData(e.currentTarget);
      const body: Record<string, any> = {
        name: form.get("name"), slug: form.get("slug"),
        price: Number(String(form.get("price")).replace(",", ".")) || 0,
        image: form.get("image") || "/images/placeholder.svg",
        stock: Number(form.get("stock")) || 0,
        stockStatus: form.get("stockStatus"), status: form.get("status"),
        featured: form.get("featured") === "on",
        shortDescription: form.get("shortDescription") || "",
        description: form.get("description") || "",
        brandId: form.get("brandId") || "", categoryId: form.get("categoryId") || "",
        sku: form.get("sku") || "", badge: form.get("badge") || "",
        benefits: form.get("benefits") || "", usage: form.get("usage") || "",
        warranty: form.get("warranty") || "", deliveryNote: form.get("deliveryNote") || "",
      };
      for (const key of ["sku", "badge", "brandId", "categoryId", "shortDescription", "description"])
        if (!body[key]) delete body[key];

      const rp = n(form.get("regularPrice") as string);
      const sp = n(form.get("salePrice") as string);
      // Always send price fields when editing (null = clear), only send when set for new products
      if (isEdit) {
        body.regularPrice = rp;
        body.salePrice = sp;
      } else {
        if (rp !== null) body.regularPrice = rp;
        if (sp !== null) body.salePrice = sp;
      }

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.errors && typeof data.errors === "object") {
          setFieldErrors(data.errors);
          setError("Ispravite označena polja.");
        } else {
          setError(data.error || `Greška ${res.status}`);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => { router.push("/admin/products"); router.refresh(); }, 600);
    } catch (e: any) {
      setError(e.message || "Greška pri spremanju");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Natrag</Link>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? "Uredi proizvod" : "Novi proizvod"}</h1>
      </div>
      {success && <AdminAlert variant="success">Proizvod spremljen!</AdminAlert>}
      {error && <AdminAlert variant="error">{error}</AdminAlert>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Osnovno</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Naziv *</label>
              <input name="name" defaultValue={product?.name} required onChange={() => clearError("name")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input name="slug" defaultValue={product?.slug} required onChange={() => clearError("slug")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.slug && <p className="mt-1 text-xs text-red-600">{fieldErrors.slug}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">EAN</label>
              <input name="sku" defaultValue={product?.sku || ""} onChange={() => clearError("sku")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.sku && <p className="mt-1 text-xs text-red-600">{fieldErrors.sku}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cijena (€) *</label>
              <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price || 0} required onChange={() => clearError("price")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.price && <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Redovna cijena</label>
              <input name="regularPrice" type="number" step="0.01" min="0" defaultValue={product?.regularPrice || ""} placeholder="—" onChange={() => clearError("regularPrice")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.regularPrice && <p className="mt-1 text-xs text-red-600">{fieldErrors.regularPrice}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Akcijska cijena</label>
              <input name="salePrice" type="number" step="0.01" min="0" defaultValue={product?.salePrice || ""} placeholder="—" onChange={() => clearError("salePrice")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.salePrice && <p className="mt-1 text-xs text-red-600">{fieldErrors.salePrice}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Zaliha</label>
              <input name="stock" type="number" step="1" min="0" defaultValue={product?.stock || 0} onChange={() => clearError("stock")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {fieldErrors.stock && <p className="mt-1 text-xs text-red-600">{fieldErrors.stock}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status zalihe</label>
              <select name="stockStatus" defaultValue={product?.stockStatus || "UNKNOWN"} onChange={() => clearError("stockStatus")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="INSTOCK">Dostupno</option><option value="OUTOFSTOCK">Nije dostupno</option><option value="ONBACKORDER">Po narudžbi</option><option value="UNKNOWN">Nepoznato</option>
              </select>
              {fieldErrors.stockStatus && <p className="mt-1 text-xs text-red-600">{fieldErrors.stockStatus}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select name="status" defaultValue={product?.status || "ACTIVE"} onChange={() => clearError("status")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="DRAFT">Skica</option><option value="ACTIVE">Aktivno</option><option value="ARCHIVED">Arhivirano</option>
              </select>
              {fieldErrors.status && <p className="mt-1 text-xs text-red-600">{fieldErrors.status}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategorija</label>
              <select name="categoryId" defaultValue={product?.categoryId || ""} onChange={() => clearError("categoryId")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fieldErrors.categoryId && <p className="mt-1 text-xs text-red-600">{fieldErrors.categoryId}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <select name="brandId" defaultValue={product?.brandId || ""} onChange={() => clearError("brandId")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="">—</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {fieldErrors.brandId && <p className="mt-1 text-xs text-red-600">{fieldErrors.brandId}</p>}
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
          <input name="image" defaultValue={product?.image || "/images/placeholder.svg"} required onChange={() => clearError("image")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          {fieldErrors.image && <p className="mt-1 text-xs text-red-600">{fieldErrors.image}</p>}
          <p className="text-xs text-slate-400 mt-1">Preporučena veličina: 1200×1200 px, WebP ili JPG, do 5 MB.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Dodatne informacije</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Ključne značajke</label><textarea name="benefits" defaultValue={product?.benefits || ""} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium">Preporučena upotreba</label><input name="usage" defaultValue={product?.usage || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium">Jamstvo</label><input name="warranty" defaultValue={product?.warranty || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium">Napomena o dostavi</label><input name="deliveryNote" defaultValue={product?.deliveryNote || ""} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products" className="inline-flex h-11 items-center rounded-lg border-2 border-slate-200 px-6 text-slate-700 hover:border-slate-300">Odustani</Link>
          <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0055a8] px-6 text-white hover:bg-[#004080] disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Spremanje..." : isEdit ? "Spremi" : "Kreiraj"}
          </button>
        </div>
      </form>
    </div>
  );
}
