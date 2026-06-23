"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { productSchema, formatZodErrors, type ProductFormData } from "@/lib/validations";

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  regularPrice: number | null;
  salePrice: number | null;
  stock: number;
  stockStatus: string;
  status: string;
  featured: boolean;
  badge: string;
  type: string;
  shortDescription: string;
  description: string;
  image: string;
  brandId: string;
  categoryId: string;
}

function toNumberOrNull(val: string): number | null {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(val: string): number | null {
  if (val === "" || val === null || val === undefined) return null;
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : null;
}

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductData | null;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [backendError, setBackendError] = useState("");
  const isEdit = !!product?.id;

  const [form, setForm] = useState<ProductData>({
    id: product?.id,
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    price: product?.price ?? 0,
    regularPrice: product?.regularPrice ?? null,
    salePrice: product?.salePrice ?? null,
    stock: product?.stock ?? 0,
    stockStatus: product?.stockStatus || "UNKNOWN",
    status: product?.status || "ACTIVE",
    featured: product?.featured || false,
    badge: product?.badge || "",
    type: product?.type || "SIMPLE",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    image: product?.image || "",
    brandId: product?.brandId || "",
    categoryId: product?.categoryId || "",
  });

  const update = (k: keyof ProductData, v: any) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
    if (backendError) setBackendError("");
    if (successMessage) setSuccessMessage("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setBackendError("");
    setSuccessMessage("");

    // Prepare data for Zod validation — convert empty strings to null for optional numeric fields
    const dataForValidation = {
      ...form,
      regularPrice: form.regularPrice ?? undefined,
      salePrice: form.salePrice ?? undefined,
      brandId: form.brandId || undefined,
      categoryId: form.categoryId || undefined,
      sku: form.sku || undefined,
      badge: form.badge || undefined,
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
    };

    const result = productSchema.safeParse(dataForValidation);
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccessMessage(
          isEdit ? "Proizvod je uspješno ažuriran." : "Proizvod je uspješno kreiran."
        );
        // Redirect after short delay to show success
        setTimeout(() => {
          router.push("/admin/products");
          router.refresh();
        }, 800);
      } else {
        // Display backend validation errors
        if (json.errors && typeof json.errors === "object") {
          setErrors(json.errors);
        } else if (json.error) {
          setBackendError(json.error);
        } else {
          setBackendError("Došlo je do greške prilikom spremanja.");
        }
      }
    } catch {
      setBackendError("Došlo je do greške prilikom spremanja. Provjerite vezu.");
    } finally {
      setLoading(false);
    }
  };

  // Field wrapper for consistent error display
  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return <p className="mt-1 text-xs text-red-600">{errors[field]}</p>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeft className="mr-1 h-4 w-4" /> Natrag
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Uredi proizvod" : "Novi proizvod"}
        </h1>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
          {successMessage}
        </div>
      )}

      {/* Backend error */}
      {backendError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          {backendError}
        </div>
      )}

      <form onSubmit={submit} className="max-w-2xl space-y-6">
        {/* Basic info */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Osnovno</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Naziv *</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
              <FieldError field="name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.slug ? "border-red-400" : "border-slate-200"}`}
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
              <FieldError field="slug" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cijena (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.price ? "border-red-400" : "border-slate-200"}`}
                value={form.price}
                onChange={(e) => update("price", toNumberOrNull(e.target.value) ?? 0)}
                required
              />
              <FieldError field="price" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Redovna cijena</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.regularPrice ?? ""}
                onChange={(e) => update("regularPrice", toNumberOrNull(e.target.value))}
                placeholder="—"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Akcijska cijena</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.salePrice ?? ""}
                onChange={(e) => update("salePrice", toNumberOrNull(e.target.value))}
                placeholder="—"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Zaliha</label>
              <input
                type="number"
                step="1"
                min="0"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.stock}
                onChange={(e) => update("stock", toIntOrNull(e.target.value) ?? 0)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status zalihe</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.stockStatus}
                onChange={(e) => update("stockStatus", e.target.value)}
              >
                <option value="INSTOCK">Dostupno</option>
                <option value="OUTOFSTOCK">Nije dostupno</option>
                <option value="ONBACKORDER">Po narudžbi</option>
                <option value="UNKNOWN">Nepoznato</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="DRAFT">Skica</option>
                <option value="ACTIVE">Aktivno</option>
                <option value="ARCHIVED">Arhivirano</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tip</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="SIMPLE">Jednostavan</option>
                <option value="VARIABLE">Varijabilan</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategorija</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.brandId}
                onChange={(e) => update("brandId", e.target.value)}
              >
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              <span className="text-sm">Istaknuto</span>
            </label>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Badge</label>
              <input
                className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="Npr. NOVO"
              />
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Opis</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Kratki opis</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
            />
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium">Opis</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={6}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </Card>

        {/* Image */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Slika *</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">URL slike</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.image ? "border-red-400" : "border-slate-200"}`}
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
            />
            <FieldError field="image" />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" disabled={loading}>
            <Link href="/admin/products">Odustani</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? "Spremanje..." : isEdit ? "Spremi" : "Kreiraj"}
          </Button>
        </div>
      </form>
    </div>
  );
}
