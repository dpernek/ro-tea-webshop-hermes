"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com";

function PaymentStatusBadge({ status }: { status: string }) {
  const colors: Record<string,string> = {
    UNPAID: "bg-slate-100 text-slate-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-200 text-gray-600",
    EXPIRED: "bg-orange-100 text-orange-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };
  const color = colors[status] || "bg-slate-100 text-slate-700";
  const label = paymentLabels[status] || status;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const router = useRouter();

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, [page, statusFilter, paymentStatusFilter]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Narudžbe ({total})</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Svi statusi narudžbe</option>
          {Object.entries(statusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={paymentStatusFilter} onChange={e => { setPaymentStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Svi statusi plaćanja</option>
          {Object.entries(paymentLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Broj</th>
                <th className="px-4 py-3 font-medium text-slate-600">Kupac</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ukupno</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Način plaćanja</th>
                <th className="px-4 py-3 font-medium text-slate-600">Plaćanje</th>
                <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td className="px-4 py-3 font-medium text-[#0055a8]">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{o.customerName}</td>
                  <td className="px-4 py-3 font-medium">{o.total?.toFixed(2)} €</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{statusLabels[o.status] || o.status}</span></td>
                  <td className="px-4 py-3"><PaymentMethodBadge method={o.paymentMethod} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString("hr-HR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {Math.ceil(total / 20) > 1 && (
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
