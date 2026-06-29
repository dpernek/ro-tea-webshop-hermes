"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Calendar, X, Loader2, AlertCircle } from "lucide-react";

const statusLabels: Record<string,string> = { PENDING:"Na čekanju", CONFIRMED:"Potvrđeno", PROCESSING:"U obradi", SHIPPED:"Poslano", COMPLETED:"Završeno", CANCELLED:"Otkazano", REFUNDED:"Refundirano" };

const paymentLabels: Record<string,string> = {
  UNPAID: "Nije plaćeno",
  PENDING: "Plaćanje u tijeku",
  PAID: "Plaćeno",
  FAILED: "Neuspjelo",
  CANCELLED: "Otkazano",
  EXPIRED: "Isteklo",
  REFUNDED: "Refundirano",
};

const paymentMethodLabels: Record<string,string> = {
  card: "Kartica (Stripe)",
  cod: "Pouzeće",
  bank_transfer: "Bankovna transakcija",
};

function PaymentStatusBadge({ status }: { status: string }) {
  const colors: Record<string,string> = {
    UNPAID: "bg-slate-200 text-slate-600 border border-slate-300",
    PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    PAID: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    FAILED: "bg-red-100 text-red-800 border border-red-300",
    CANCELLED: "bg-gray-100 text-gray-500 border border-gray-300",
    EXPIRED: "bg-orange-100 text-orange-800 border border-orange-300",
    REFUNDED: "bg-blue-100 text-blue-800 border border-blue-300",
  };
  const color = colors[status] || "bg-slate-100 text-slate-700";
  const label = paymentLabels[status] || status;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {status === "PAID" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {status === "FAILED" && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
      {status === "EXPIRED" && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
      {status === "PENDING" && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />}
      {status === "UNPAID" && <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
      {label}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: string }) {
  if (!method) return <span className="text-slate-400">-</span>;
  const isStripe = method === "card" || method === "stripe";
  const label = paymentMethodLabels[method] || method;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
      isStripe ? "bg-[#635BFF] text-white" : "bg-slate-100 text-slate-700"
    }`}>
      {isStripe && (
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.3 5.1c0-.7.6-1 1.5-1 .9 0 2.1.3 3 .8V2.2C10.7 1.5 9.3 1 7.8 1 5.1 1 3.2 2.5 3.2 4.9c0 3.8 5.2 3.2 5.2 4.8 0 .6-.5.8-1.4.8-1.2 0-2.7-.5-3.5-1.1v2.8c.9.4 1.8.6 2.9.6 2.8 0 4.7-1.4 4.7-3.9-.1-4.1-5.3-3.4-5.3-5z"/>
        </svg>
      )}
      {label}
    </span>
  );
}

function StripeTestMethodBadge({ sessionId }: { sessionId?: string }) {
  if (!sessionId || !sessionId.startsWith("cs_test_")) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-semibold text-amber-800" title="Stripe testna sesija — koriste se testni ključevi">
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a2 2 0 0 0-2 2v1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2V3a2 2 0 0 0-2-2H8Zm0 1a1 1 0 0 1 1 1v1H7V3a1 1 0 0 1 1-1Z"/>
      </svg>
      Test
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string,string> = {
    PENDING: "bg-slate-100 text-slate-700 border border-slate-300",
    CONFIRMED: "bg-blue-100 text-blue-800 border border-blue-300",
    PROCESSING: "bg-indigo-100 text-indigo-800 border border-indigo-300",
    SHIPPED: "bg-amber-100 text-amber-800 border border-amber-300",
    COMPLETED: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    CANCELLED: "bg-red-100 text-red-800 border border-red-300",
    REFUNDED: "bg-violet-100 text-violet-800 border border-violet-300",
  };
  const color = colors[status] || "bg-slate-100 text-slate-700";
  const label = statusLabels[status] || status;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {status === "COMPLETED" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {status === "CANCELLED" && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
      {status === "SHIPPED" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
          <div className="h-5 w-24 rounded-full bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function Wrapper() {
  return (
    <Suspense fallback={<div className="p-8">Učitavanje...</div>}>
      <AdminOrdersPage />
    </Suspense>
  );
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [unreadFilter, setUnreadFilter] = useState(false);
  const [glsFilter, setGlsFilter] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  // Sync searchParams → filter state on mount and when URL changes
  // Chips update state directly; this effect only handles external URL changes
  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "");
    setPaymentStatusFilter(searchParams.get("paymentStatus") || "");
    setUnreadFilter(searchParams.get("unread") === "1");
    setGlsFilter(searchParams.get("gls") === "1");
    setPaymentMethodFilter(searchParams.get("paymentMethod") || "");
    if (!ready) setReady(true);
  }, [searchParams]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const buildParams = () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
    if (unreadFilter) params.set("unread", "1");
    if (paymentMethodFilter) params.set("paymentMethod", paymentMethodFilter);
    if (glsFilter) params.set("gls", "1");
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders?${buildParams()}`);
      if (!res.ok) throw new Error("Greška pri učitavanju narudžbi.");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju narudžbi.");
    } finally {
      setLoading(false);
    }
    // buildParams accesses only the same deps
  }, [page, statusFilter, paymentStatusFilter, unreadFilter, glsFilter, paymentMethodFilter, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready) load(); }, [load, ready]);

  // Re-fetch when returning from order detail (component stays mounted)
  useEffect(() => {
    const onVisibilityChange = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [load]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/orders/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `narudzbe-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Greška pri izvozu CSV-a. Pokušajte ponovno.");
    } finally {
      setExporting(false);
    }
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Narudžbe ({total})</h1>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {exporting ? "Izvoz..." : "CSV Izvoz"}
        </Button>
      </div>

      {/* Quick filter chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { label: "Nepregledane", onClick: () => { setUnreadFilter(true); setGlsFilter(false); setStatusFilter(""); setPaymentStatusFilter(""); setPaymentMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }, active: unreadFilter && !glsFilter && !statusFilter && !paymentStatusFilter && !paymentMethodFilter },
          { label: "Na čekanju", onClick: () => { setUnreadFilter(false); setGlsFilter(false); setStatusFilter("PENDING"); setPaymentStatusFilter(""); setPaymentMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }, active: statusFilter === "PENDING" && !unreadFilter && !glsFilter && !paymentMethodFilter },
          { label: "Neplaćene", onClick: () => { setUnreadFilter(false); setGlsFilter(false); setStatusFilter(""); setPaymentStatusFilter("UNPAID"); setPaymentMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }, active: paymentStatusFilter === "UNPAID" && !unreadFilter && !glsFilter && !statusFilter && !paymentMethodFilter },
          { label: "GLS bez pošiljke", onClick: () => { setGlsFilter(true); setUnreadFilter(false); setStatusFilter(""); setPaymentStatusFilter(""); setPaymentMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }, active: glsFilter && !unreadFilter && !statusFilter && !paymentStatusFilter && !paymentMethodFilter },
          { label: "Pouzeće", onClick: () => { setUnreadFilter(false); setGlsFilter(false); setStatusFilter(""); setPaymentStatusFilter(""); setPaymentMethodFilter("cod"); setDateFrom(""); setDateTo(""); setPage(1); }, active: paymentMethodFilter === "cod" && !unreadFilter && !glsFilter && !statusFilter && !paymentStatusFilter },
          { label: "Očisti filtere", onClick: () => { setUnreadFilter(false); setGlsFilter(false); setStatusFilter(""); setPaymentStatusFilter(""); setPaymentMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }, active: !statusFilter && !paymentStatusFilter && !paymentMethodFilter && !dateFrom && !dateTo && !unreadFilter && !glsFilter, reset: true },
        ].map(chip => (
          <button
            key={chip.label}
            onClick={chip.onClick}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              chip.reset
                ? "border-slate-300 text-slate-500 hover:bg-slate-100"
                : chip.active
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Svi statusi narudžbe</option>
          {Object.entries(statusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white" value={paymentStatusFilter} onChange={e => { setPaymentStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Svi statusi plaćanja</option>
          {Object.entries(paymentLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm bg-white w-40"
            />
          </div>
          <span className="text-slate-400 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white w-40"
          />
          {(dateFrom || dateTo) && (
            <button onClick={clearDateFilters} className="p-2 text-slate-400 hover:text-slate-600" title="Očisti datume">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

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
                  <th className="px-4 py-3 font-medium text-slate-600">Broj</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Kupac</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Ukupno</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Način plaćanja</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Dostava</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Plaćanje</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                    <td className="px-4 py-3 font-medium text-[#0055a8]">
                      <div className="flex items-center gap-1.5">
                        {o.orderNumber}
                        <StripeTestMethodBadge sessionId={o.stripeCheckoutSessionId} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{o.customerName}</td>
                    <td className="px-4 py-3 font-medium">{o.total?.toFixed(2)} €</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><PaymentMethodBadge method={o.paymentMethod} /></td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[100px] truncate">{o.shippingMethod || "-"}</td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString("hr-HR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && Math.ceil(total / 20) > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prethodna</Button>
            <span className="text-sm text-slate-500">{page} / {Math.ceil(total / 20)}</span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Sljedeća</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
