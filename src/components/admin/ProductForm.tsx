"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createProduct, updateProduct } from "@/lib/actions/products";

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    price: number;
    regularPrice: number | null;
    salePrice: number | null;
    stock: number | null;
    stockStatus: string;
    status: string;
    featured: boolean;
    badge: string | null;
    type: string;
    image: string;
    gallery: string;
    shortDescription: string;
    description: string;
    specifications: string;
    metaTitle: string | null;
    metaDescription: string | null;
    weight: number | null;
    width: number | null;
    height: number | null;
    depth: number | null;
    taxRate: number | null;
    categoryId: string | null;
    brandId: string | null;
  } | null;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    price: product?.price?.toString() || "0",
    regularPrice: product?.regularPrice?.toString() || "",
    salePrice: product?.salePrice?.toString() || "",
    taxRate: product?.taxRate?.toString() || "25",
    stock: product?.stock?.toString() || "",
    stockStatus: product?.stockStatus || "UNKNOWN",
    status: product?.status || "ACTIVE",
    featured: product?.featured || false,
    badge: product?.badge || "",
    type: product?.type || "SIMPLE",
    image: product?.image || "",
    gallery: product?.gallery || "[]",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    specifications: product?.specifications || "{}",
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
    weight: product?.weight?.toString() || "",
    width: product?.width?.toString() || "",
    height: product?.height?.toString() || "",
    depth: product?.depth?.toString() || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type: inputType } = e.target;
    if (inputType === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === "name" && !isEdit) {
      // Auto-generate slug
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setFormData((prev) => ({ ...prev, name: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      fd.append(key, String(value ?? ""));
    });

    try {
      if (isEdit) {
        await updateProduct(product.id, fd);
        router.push("/admin/products");
      } else {
        await createProduct(fd);
        router.push("/admin/products");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri spremanju proizvoda"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Natrag
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? `Uredi: ${product.name}` : "Novi proizvod"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Osnovni podaci
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Naziv *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                SKU
              </label>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kategorija
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Brend
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tip
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="SIMPLE">Jednostavni</option>
                <option value="VARIABLE">Varijabilni</option>
                <option value="UNKNOWN">Nepoznat</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">Aktivno</option>
                <option value="DRAFT">Skica</option>
                <option value="ARCHIVED">Arhivirano</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Cijene</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Cijena (€) *
              </label>
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                type="number"
                step="0.01"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Regularna (€)
              </label>
              <input
                name="regularPrice"
                value={formData.regularPrice}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Akcijska (€)
              </label>
              <input
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Porez (%)
              </label>
              <input
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Stock */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Zaliha</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Količina
              </label>
              <input
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                type="number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status zalihe
              </label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="INSTOCK">Dostupno</option>
                <option value="OUTOFSTOCK">Nije dostupno</option>
                <option value="ONBACKORDER">Narudžba</option>
                <option value="UNKNOWN">Upit</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span className="text-sm text-slate-700">Istaknuti proizvod</span>
            </label>
          </div>
          <div className="mt-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Badge
            </label>
            <input
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Slike</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Glavna slika (URL)
              </label>
              <input
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {formData.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-lg bg-slate-100 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Galerija (JSON array URL-ova)
              </label>
              <input
                name="gallery"
                value={formData.gallery}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Sadržaj</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Kratki opis
            </label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Opis
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Specifikacije (JSON {"{}"})
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </Card>

        {/* SEO */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Meta title
              </label>
              <input
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Meta description
              </label>
              <input
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/products">Odustani</Link>
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? "Spremi promjene" : "Kreiraj proizvod"}
          </Button>
        </div>
      </form>
    </div>
  );
}
