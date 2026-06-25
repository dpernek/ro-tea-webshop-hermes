"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  Square,
  CheckSquare,
  ChevronDown,
  Eye,
  Undo2,
  Percent,
  Tag,
  RefreshCw,
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

interface PreviewItem {
  productId: string;
  productName: string;
  oldPrice: number;
  oldRegularPrice: number | null;
  oldSalePrice: number | null;
  newPrice: number;
  newRegularPrice: number | null;
  newSalePrice: number | null;
  status: "updated" | "skipped";
  skipReason?: string;
}

type BulkActionType =
  | "discountPercent"
  | "increasePercent"
  | "decreasePercent"
  | "setSalePrice"
  | "removeSale"
  | "status"
  | "stockStatus";

const BULK_ACTIONS: { value: BulkActionType | ""; label: string; icon: React.ReactNode }[] = [
  { value: "", label: "Odaberi akciju...", icon: null },
  { value: "discountPercent", label: "Popust % (akcijska)", icon: <Percent className="h-4 w-4" /> },
  { value: "increasePercent", label: "Povećaj cijenu %", icon: <Percent className="h-4 w-4" /> },
  { value: "decreasePercent", label: "Smanji cijenu %", icon: <Percent className="h-4 w-4" /> },
  { value: "setSalePrice", label: "Fiksna akcijska cijena", icon: <Tag className="h-4 w-4" /> },
  { value: "removeSale", label: "Makni akciju", icon: <X className="h-4 w-4" /> },
  { value: "status", label: "Promijeni status", icon: <RefreshCw className="h-4 w-4" /> },
  { value: "stockStatus", label: "Promijeni stanje zalihe", icon: <Package className="h-4 w-4" /> },
];

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

  // --- Bulk panel state ---
  const [bulkAction, setBulkAction] = useState<BulkActionType | "">("");
  const [saleHandling, setSaleHandling] = useState<"keep" | "clear" | "recalculateSameDiscount">("keep");
  const [bulkValue, setBulkValue] = useState("");

  // --- Preview modal state ---
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [previewUpdatedCount, setPreviewUpdatedCount] = useState(0);
  const [previewSkippedCount, setPreviewSkippedCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // --- Apply state ---
  const [bulking, setBulking] = useState(false);
  const [lastOperationId, setLastOperationId] = useState<string | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);

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
      setError(
        e instanceof Error ? e.message : "Greška pri učitavanju proizvoda"
      );
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
  }, [page, reloadKey, load]);

  // --- Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati proizvod?")) return;
    setIsDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Neuspješno brisanje proizvoda");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      load();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Greška pri brisanju proizvoda"
      );
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
    setBulkAction("");
    setBulkValue("");
  };

  // --- Preview ---
  const handlePreview = async () => {
    if (!bulkAction) return;
    setPreviewLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        ids: Array.from(selectedIds),
        selectAll: selectAllFiltered,
        filters: {
          search,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
        },
        action: bulkAction,
        value: bulkAction === "removeSale" ? null : Number(bulkValue),
        saleHandling: saleHandling as "keep" | "clear" | "recalculateSameDiscount",
        preview: true,
      };

      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri pregledu");

      setPreviewData(data.items || []);
      setPreviewUpdatedCount(data.updatedCount || 0);
      setPreviewSkippedCount(data.skippedCount || 0);
      setShowPreview(true);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Greška pri pregledu promjena"
      );
    }
    setPreviewLoading(false);
  };

  // --- Apply ---
  const handleApply = async () => {
    if (!bulkAction) return;
    setBulking(true);
    setError("");
    setSuccess("");
    setShowPreview(false);

    try {
      const body: Record<string, unknown> = {
        ids: Array.from(selectedIds),
        selectAll: selectAllFiltered,
        filters: {
          search,
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
        },
        action: bulkAction,
        value: bulkAction === "removeSale" ? null : Number(bulkValue),
        saleHandling: saleHandling as "keep" | "clear" | "recalculateSameDiscount",
        preview: false,
      };

      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri ažuriranju");

      setLastOperationId(data.operationId || null);
      setSuccess(`Ažurirano ${data.updated}, preskočeno ${data.skipped}`);
      clearSelection();
      load();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Greška pri ažuriranju proizvoda"
      );
    }
    setBulking(false);
  };

  // --- Rollback ---
  const handleRollback = async () => {
    if (!lastOperationId) return;
    setRollbackLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/products/bulk/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationId: lastOperationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri vraćanju");

      setSuccess(`Vraćeno ${data.restored} proizvoda na prethodne vrijednosti.`);
      setLastOperationId(null);
      load();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Greška pri vraćanju promjene"
      );
    }
    setRollbackLoading(false);
  };

  // --- Computed ---
  const totalPages = Math.ceil(total / LIMIT);
  const needsValueInput = bulkAction && bulkAction !== "removeSale";
  const canPreview = bulkAction && (bulkAction === "removeSale" || bulkAction === "status" || bulkAction === "stockStatus" || bulkValue);

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
      {error && (
        <AdminAlert variant="error">
          <span>{error}</span>
          {lastOperationId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setError("")}
              className="ml-auto shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </AdminAlert>
      )}
      {success && (
        <AdminAlert variant="success">
          <div className="flex flex-wrap items-center gap-3 w-full">
            <span className="flex-1">{success}</span>
            {lastOperationId && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRollback}
                isLoading={rollbackLoading}
                className="shrink-0 border-green-400 text-green-700 hover:bg-green-100"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Vrati ovu promjenu
              </Button>
            )}
          </div>
        </AdminAlert>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          BULK PANEL
          ═══════════════════════════════════════════════════════════════════ */}
      {anySelected && (
        <Card className="mb-4 border-[#0055a8] bg-[#0055a8]/[0.04] shadow-none">
          <div className="px-4 py-3 flex flex-wrap items-center gap-3">
            {/* Selection count */}
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0055a8]">
              <CheckSquare className="h-4 w-4" />
              <span>
                {selectedCount} proizvoda odabrano
                <span className="ml-1 font-normal text-[#0055a8]/70">
                  ({selectAllFiltered ? "svi filtrirani" : "na ovoj stranici"})
                </span>
              </span>
            </div>

            <div className="w-px h-6 bg-[#0055a8]/15" />

            {/* Action dropdown */}
            <div className="relative">
              <select
                className="h-9 appearance-none rounded-lg border border-[#0055a8]/30 bg-white px-3 pr-8 text-sm text-slate-900 focus:border-brand focus:ring-1 focus:ring-brand"
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value as BulkActionType | "");
                  if (e.target.value === "removeSale") setBulkValue("");
                }}
              >
                {BULK_ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Value input (shown for actions that need a value) */}
            {needsValueInput && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={bulkAction === "discountPercent" ? 95 : bulkAction === "setSalePrice" ? undefined : 100}
                  placeholder={
                    bulkAction === "setSalePrice" ? "Cijena (€)" : "Postotak"
                  }
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="h-9 w-28 rounded-lg border border-[#0055a8]/30 px-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                />
                {bulkAction !== "setSalePrice" && (
                  <span className="text-sm text-slate-500">%</span>
                )}
              </div>
            )}

            {/* Sale handling for increase/decrease percent */}
            {(bulkAction === "increasePercent" || bulkAction === "decreasePercent") && (
              <select
                value={saleHandling}
                onChange={(e) => setSaleHandling(e.target.value as "keep" | "clear" | "recalculateSameDiscount")}
                className="h-9 rounded-lg border border-[#0055a8]/30 px-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                aria-label="Što s postojećim akcijskim cijenama?"
              >
                <option value="keep">Zadrži akciju ako je valjana</option>
                <option value="clear">Makni akciju</option>
                <option value="recalculateSameDiscount">Preračunaj isti popust</option>
              </select>
            )}

            {/* Preview button */}
            <Button
              size="sm"
              onClick={handlePreview}
              disabled={!canPreview || previewLoading}
              isLoading={previewLoading}
            >
              <Eye className="h-3.5 w-3.5" />
              Prikaži pregled
            </Button>

            {/* Spacer + clear */}
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
        </Card>
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
                              <Image
                                src={p.image}
                                width={40}
                                height={40}
                                className="rounded object-cover"
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

      {/* ═══════════════════════════════════════════════════════════════════
          PREVIEW MODAL
          ═══════════════════════════════════════════════════════════════════ */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-3xl max-h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Pregled promjena
              </h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Table body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {previewData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nema podataka za pregled.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-3 font-medium text-slate-600">Proizvod</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Stara cijena</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Stara redovna</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Stara akcijska</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Nova cijena</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Nova redovna</th>
                      <th className="py-2 px-3 font-medium text-slate-600 text-right">Nova akcijska</th>
                      <th className="py-2 pl-3 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50">
                        <td className="py-2 pr-3 font-medium text-slate-900 max-w-[200px] truncate">
                          {item.productName}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.oldPrice.toFixed(2)} €
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.oldRegularPrice != null
                            ? `${item.oldRegularPrice.toFixed(2)} €`
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.oldSalePrice != null
                            ? `${item.oldSalePrice.toFixed(2)} €`
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.newPrice !== item.oldPrice ? (
                            <span className="font-semibold text-[#0055a8]">
                              {item.newPrice.toFixed(2)} €
                            </span>
                          ) : (
                            <span className="text-slate-900">
                              {item.newPrice.toFixed(2)} €
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.newRegularPrice != null
                            ? `${item.newRegularPrice.toFixed(2)} €`
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {item.newSalePrice != null ? (
                            <span className="font-semibold text-red-600">
                              {item.newSalePrice.toFixed(2)} €
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 pl-3">
                          {item.status === "updated" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              <Check className="h-3 w-3" />
                              Ažurira se
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                              title={item.skipReason}
                            >
                              <X className="h-3 w-3" />
                              Preskače
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4">
              {/* Summary */}
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-semibold text-green-700">
                  {previewUpdatedCount} proizvoda
                </span>{" "}
                će biti ažurirano
                {previewSkippedCount > 0 && (
                  <>
                    {", "}
                    <span className="font-semibold text-amber-700">
                      {previewSkippedCount} preskočeno
                    </span>
                  </>
                )}
              </p>

              {/* Warning */}
              <div className="flex items-start gap-2 text-xs text-slate-500 mb-4">
                <Undo2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#0055a8]" />
                <span>
                  Ova akcija se može vratiti. Promjene će biti spremljene u
                  povijest.
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  Odustani
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={previewUpdatedCount === 0 || bulking}
                  isLoading={bulking}
                >
                  <Check className="h-3.5 w-3.5" />
                  Primijeni
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
