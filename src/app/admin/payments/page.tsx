"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, X, AlertCircle } from "lucide-react";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ orderId: "", method: "", status: "", amountMin: "", amountMax: "" });
  const [applied, setApplied] = useState({ orderId: "", method: "", status: "", amountMin: "", amountMax: "" });

  const load = useCallback(async (p = 1, f = applied) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (f.orderId) params.set("orderId", f.orderId);
      if (f.method) params.set("method", f.method);
      if (f.status) params.set("status", f.status);
      if (f.amountMin) params.set("amountMin", f.amountMin);
      if (f.amountMax) params.set("amountMax", f.amountMax);

      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error("Greška pri učitavanju plaćanja.");
      const data = await res.json();
      setPayments(data.payments);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju plaćanja.");
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = () => {
    setApplied({ ...filters });
    load(1, filters);
  };

  const clearFilters = () => {
    const empty = { orderId: "", method: "", status: "", amountMin: "", amountMax: "" };
    setFilters(empty);
    setApplied(empty);
    load(1, empty);
  };

  const hasFilters = applied.orderId || applied.method || applied.status || applied.amountMin || applied.amountMax;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
      REFUNDED: "bg-blue-100 text-blue-700",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[s] || "bg-slate-100 text-slate-600"}`}>{s}</span>;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Plaćanja {total > 0 && <span className="text-base font-normal text-slate-500">({total})</span>}
      </h1>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Narudžba</label>
            <input
              className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="ID narudžbe"
              value={filters.orderId}
              onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Metoda</label>
            <select
              className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
            >
              <option value="">Sve</option>
              <option value="bank_transfer">Bankovni prijenos</option>
              <option value="cash_on_delivery">Pouzeće</option>
              <option value="card">Kartica</option>
              <option value="stripe">Stripe</option>
              <option value="monri">Monri</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
            <select
              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Svi</option>
              <option value="PENDING">Na čekanju</option>
              <option value="COMPLETED">Završeno</option>
              <option value="FAILED">Neuspjelo</option>
              <option value="REFUNDED">Povrat</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Iznos od (€)</label>
            <input
              type="number"
              step="0.01"
              className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Min"
              value={filters.amountMin}
              onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Iznos do (€)</label>
            <input
              type="number"
              step="0.01"
              className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Max"
              value={filters.amountMax}
              onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
            />
          </div>
          <Button size="sm" onClick={applyFilters}>
            <Search className="mr-1 h-4 w-4" /> Filtriraj
          </Button>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" /> Očisti
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {error ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <Skeleton />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Narudžba</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Kupac</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Iznos</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Metoda</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Nema plaćanja
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.order?.orderNumber || p.orderId?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.order?.customerName || "-"}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.amount?.toFixed(2)} {p.currency || "€"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{p.provider}/{p.method}</span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("hr-HR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              Stranica {page} od {pages} ({total} ukupno)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                Prethodna
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => load(page + 1)}
              >
                Sljedeća
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
