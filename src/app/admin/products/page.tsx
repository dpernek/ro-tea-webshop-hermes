"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Square,
  CheckSquare,
  ChevronDown,
  Tag,
  ToggleLeft,
  Package,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  regularPrice: number | null;
  stockStatus: string;
  status: string;
  image: string;
  sku: string;
  categoryId?: string;
  brandId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

type BulkAction = "salePrice" | "status" | "stockStatus" | null;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Aktivno" },
  { value: "DRAFT", label: "Skica" },
  { value: "ARCHIVED", label: "Arhivirano" },
] as const;

const STOCK_OPTIONS = [
  { value: "INSTOCK", label: "Dostupno" },
  { value: "OUTOFSTOCK", label: "Nema na zalihi" },
  { value: "ONBACKORDER", label: "Na narudžbi" },
] as const;

const LIMIT = 20;

export default function AdminProductsPage() {
  const router = useRouter();

  // --- Data state ---
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());

  // --- Selection state ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);

  // --- Bulk action state ---
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [bulkValue, setBulkValue] = useState("");
  const [bulking, setBulking] = useState(false);

  // --- Initial load of filter options ---
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then(setBrands)
      .catch(() => {});
  }, []);

  // --- Load products ---
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        search,
      });
      if (categoryId) params.set("categoryId", categoryId);
      if (brandId) params.set("brandId", brandId);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Neuspješno dohvaćanje proizvoda");
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška pri učitavanju proizvoda");
    }
    setLoading(false);
  }, [page, search, categoryId, brandId]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Reload counter (bumps on any filter/search/pagination change) ---
  const [reloadKey, setReloadKey] = useState(0);

  const triggerReload = () => setReloadKey((k) => k + 1);

  const doSearch = () => {
    setPage(1);
    setSelectedIds(new Set());
    setSelectAllFiltered(false);
    triggerReload();
  };

  // When page changes or reloadKey bumps, fetch data
  useEffect(() => {
    load();
  }, [page, reloadKey]);

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati proizvod?")) return;
    setIsDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Neuspješno brisanje proizvoda");
      // Remove from selection if present
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška pri brisanju proizvoda");
    } finally {
      setIsDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // --- Selection helpers ---
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectAllFiltered(false);
  };

  const toggleSelectAll = () => {
    if (selectAllFiltered) {
      setSelectAllFiltered(false);
      setSelectedIds(new Set());
    } else {
      setSelectAllFiltered(true);
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const selectedCount = selectAllFiltered ? total : selectedIds.size;
  const anySelected = selectedCount > 0;
  const allVisibleSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllFiltered(false);
    setBulkAction(null);
    setBulkValue("");
  };

  // --- Bulk action submit ---
  const handleBulkSubmit = async () => {
    if (!bulkAction) return;
    setBulking(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          selectAll: selectAllFiltered,
          filters: {
            search,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
          },
          action: bulkAction,
          value: bulkAction === "salePrice" ? Number(bulkValue) : bulkValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri ažuriranju");

      setSuccess(`Ažurirano ${data.updated} proizvoda.`);
      clearSelection();
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Greška pri ažuriranju");
    }
    setBulking(false);
  };

  // --- Computed ---
  const totalPages = Math.ceil(total / LIMIT);

  // ==========================================================================
  //  RENDER
  // ==========================================================================
  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Proizvodi ({total})
        </h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Novi proizvod
          </Link>
        </Button>
      </div>

      {/* ── Filters row ── */}
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm"
            placeholder="Pretraži..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
        </div>

        {/* Category filter */}
        <div className="relative min-w-[160px]">
          <select
            className="h-[38px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
              setSelectedIds(new Set());
              setSelectAllFiltered(false);
              triggerReload();
            }}
          >
            <option value="">Sve kategorije</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Brand filter */}
        <div className="relative min-w-[160px]">
          <select
            className="h-[38px] w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand"
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setPage(1);
              setSelectedIds(new Set());
              setSelectAllFiltered(false);
              triggerReload();
            }}
          >
            <option value="">Svi brendovi</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={doSearch}
          disabled={loading}
          isLoading={loading}
        >
          Traži
        </Button>
      </div>

      {/* ── Alerts ── */}
      {error && <AdminAlert variant="error">{error}</AdminAlert>}
      {success && <AdminAlert variant="success">{success}</AdminAlert>}

      {/* ═══════════════════════════════════════════════════════════════════
          BULK ACTION BAR
          ═══════════════════════════════════════════════════════════════════ */}
      {anySelected && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#0055a8] bg-[#0055a8]/5 px-4 py-3">
          {/* Selected count */}
          <span className="text-sm font-semibold text-[#0055a8]">
            {selectedCount} proizvoda odabrano
          </span>

          <div className="w-px h-6 bg-[#0055a8]/20" />

          {/* Sale price button + inline form */}
          {bulkAction === "salePrice" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Akcijska cijena (€)"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="h-8 w-40 rounded border border-slate-200 px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                onKeyDown={(e) => e.key === "Enter" && handleBulkSubmit()}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleBulkSubmit}
                disabled={!bulkValue || bulking}
                isLoading={bulking}
              >
                <Check className="h-3.5 w-3.5" />
                Primijeni
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBulkAction(null);
                  setBulkValue("");
                }}
                disabled={bulking}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkAction("salePrice")}
            >
              <Tag className="h-3.5 w-3.5" />
              Postavi akcijsku cijenu
            </Button>
          )}

          {/* Status dropdown */}
          {bulkAction === "status" ? (
            <div className="flex items-center gap-2">
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="h-8 rounded border border-slate-200 px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                autoFocus
              >
                <option value="">Odaberi status...</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleBulkSubmit}
                disabled={!bulkValue || bulking}
                isLoading={bulking}
              >
                <Check className="h-3.5 w-3.5" />
                Primijeni
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBulkAction(null);
                  setBulkValue("");
                }}
                disabled={bulking}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkAction("status")}
            >
              <ToggleLeft className="h-3.5 w-3.5" />
              Promijeni status
            </Button>
          )}

          {/* Stock status dropdown */}
          {bulkAction === "stockStatus" ? (
            <div className="flex items-center gap-2">
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="h-8 rounded border border-slate-200 px-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                autoFocus
              >
                <option value="">Odaberi stanje...</option>
                {STOCK_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleBulkSubmit}
                disabled={!bulkValue || bulking}
                isLoading={bulking}
              >
                <Check className="h-3.5 w-3.5" />
                Primijeni
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setBulkAction(null);
                  setBulkValue("");
                }}
                disabled={bulking}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkAction("stockStatus")}
            >
              <Package className="h-3.5 w-3.5" />
              Promijeni stanje zalihe
            </Button>
          )}

          {/* Clear selection */}
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
            Poništi odabir
          </Button>
        </div>
      )}

      {/* ── Table ── */}
      <Card>
        {loading ? (
          <AdminTableSkeleton rows={8} cols={7} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {/* Checkbox column */}
                    <th className="w-10 px-3 py-3">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="inline-flex items-center justify-center text-slate-400 hover:text-[#0055a8] transition-colors"
                        title={
                          selectAllFiltered
                            ? "Poništi odabir svih"
                            : "Odaberi sve filtrirane"
                        }
                      >
                        {selectAllFiltered || allVisibleSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#0055a8]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Slika
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Naziv
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Cijena
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Akcijska
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-600">
                      Zaliha
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Nema pronađenih proizvoda.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const hasSale =
                        p.salePrice != null && p.salePrice < p.price;
                      const deleting = isDeleting.has(p.id);
                      const checked =
                        selectAllFiltered || selectedIds.has(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          {/* Checkbox */}
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => toggleSelect(p.id)}
                              className="inline-flex items-center justify-center text-slate-400 hover:text-[#0055a8] transition-colors"
                            >
                              {checked ? (
                                <CheckSquare className="h-4 w-4 text-[#0055a8]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          {/* Image */}
                          <td className="px-4 py-3">
                            {p.image ? (
                              <img
                                src={p.image}
                                className="h-10 w-10 rounded object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-slate-100" />
                            )}
                          </td>
                          {/* Name */}
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                            {p.name}
                          </td>
                          {/* Price */}
                          <td className="px-4 py-3">
                            {hasSale ? (
                              <span className="text-xs text-slate-400 line-through">
                                {p.price.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="font-medium">
                                {p.price.toFixed(2)} €
                              </span>
                            )}
                          </td>
                          {/* Sale price */}
                          <td className="px-4 py-3">
                            {hasSale ? (
                              <span className="font-bold text-red-600">
                                {p.salePrice!.toFixed(2)} €
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          {/* Stock status */}
                          <td className="px-4 py-3">
                            {p.stockStatus === "INSTOCK" ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Dostupno
                              </span>
                            ) : p.stockStatus === "OUTOFSTOCK" ? (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Nema
                              </span>
                            ) : p.stockStatus === "ONBACKORDER" ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Narudžba
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                —
                              </span>
                            )}
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(`/admin/products/${p.id}/edit`)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(p.id)}
                                disabled={deleting}
                                isLoading={deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prethodna
                </Button>
                <span className="text-sm text-slate-500">
                  Stranica {page} od {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sljedeća
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
