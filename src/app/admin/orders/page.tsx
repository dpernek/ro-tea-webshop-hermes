"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const statusLabels: Record<string,string> = { PENDING:"Na čekanju", CONFIRMED:"Potvrđeno", PROCESSING:"U obradi", SHIPPED:"Poslano", COMPLETED:"Završeno", CANCELLED:"Otkazano", REFUNDED:"Refundirano" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders);
    setTotal(data.total);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Narudžbe ({total})</h1>

      <div className="mb-4 flex gap-2">
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Svi statusi</option>
          {Object.entries(statusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
                  <td className="px-4 py-3 text-slate-500">{o.paymentStatus}</td>
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
