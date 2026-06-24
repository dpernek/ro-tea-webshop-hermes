"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";

interface Product {
  id: string; name: string; slug: string;
  price: number; salePrice: number | null; regularPrice: number | null;
  stockStatus: string; status: string; image: string; sku: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<Set<string>>(new Set());
  const router = useRouter();
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Neuspješno dohvaćanje proizvoda");
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju proizvoda");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Jeste li sigurni da želite obrisati proizvod?")) return;
    setIsDeleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Neuspješno brisanje proizvoda");
      load();
    } catch (e: any) {
      setError(e.message || "Greška pri brisanju proizvoda");
    } finally {
      setIsDeleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const doSearch = () => {
    setPage(1);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Proizvodi ({total})</h1>
        <Button asChild><Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Novi proizvod</Link></Button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm"
            placeholder="Pretraži..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
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

      {error && <AdminAlert variant="error">{error}</AdminAlert>}

      <Card>
        {loading ? (
          <AdminTableSkeleton rows={8} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Slika</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Cijena</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Akcijska</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Zaliha</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                        Nema pronađenih proizvoda.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const hasSale = p.salePrice != null && p.salePrice < p.price;
                      const deleting = isDeleting.has(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            {p.image && <img src={p.image} className="h-10 w-10 rounded object-cover" alt="" />}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{p.name}</td>
                          <td className="px-4 py-3">
                            {hasSale ? (
                              <span className="text-xs text-slate-400 line-through">{p.price.toFixed(2)} €</span>
                            ) : (
                              <span className="font-medium">{p.price.toFixed(2)} €</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {hasSale ? (
                              <span className="font-bold text-red-600">{p.salePrice!.toFixed(2)} €</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.stockStatus === "INSTOCK" ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Dostupno</span>
                            ) : p.stockStatus === "OUTOFSTOCK" ? (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Nema</span>
                            ) : p.stockStatus === "ONBACKORDER" ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Narudžba</span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/products/${p.id}/edit`)}>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prethodna</Button>
                <span className="text-sm text-slate-500">Stranica {page} od {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sljedeća</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
