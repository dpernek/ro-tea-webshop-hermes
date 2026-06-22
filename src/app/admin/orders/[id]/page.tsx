"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<string,string> = { PENDING:"Na čekanju", CONFIRMED:"Potvrđeno", PROCESSING:"U obradi", SHIPPED:"Poslano", COMPLETED:"Završeno", CANCELLED:"Otkazano", REFUNDED:"Refundirano" };
const paymentLabels: Record<string,string> = { UNPAID:"Nije plaćeno", PENDING:"Na čekanju", PAID:"Plaćeno", FAILED:"Neuspjelo", REFUNDED:"Refundirano" };

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then(r => r.json()).then(o => {
      setOrder(o);
      setStatus(o.status);
      setPaymentStatus(o.paymentStatus);
      setAdminNote(o.adminNote || "");
    });
  }, [id]);

  const save = async () => {
    await fetch(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status, paymentStatus, adminNote }), headers: { "Content-Type": "application/json" } });
    router.refresh();
  };

  if (!order) return <p className="p-8 text-slate-500">Učitavanje...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm"><Link href="/admin/orders"><ArrowLeft className="mr-1 h-4 w-4" /> Natrag</Link></Button>
        <h1 className="text-2xl font-bold text-slate-900">Narudžba {order.orderNumber}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Podaci o kupcu</h2>
          <p className="text-sm text-slate-600"><strong>Ime:</strong> {order.customerName}</p>
          <p className="text-sm text-slate-600"><strong>Email:</strong> {order.customerEmail}</p>
          <p className="text-sm text-slate-600"><strong>Telefon:</strong> {order.customerPhone}</p>
          <p className="text-sm text-slate-600"><strong>Adresa:</strong> {order.shippingAddress || order.billingAddress || "-"}</p>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Status</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Status narudžbe</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                {Object.entries(statusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status plaćanja</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                {Object.entries(paymentLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Interna napomena</label>
              <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            </div>
            <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Spremi promjene</Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Stavke narudžbe</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Proizvod</th>
              <th className="px-4 py-3 font-medium text-slate-600">SKU</th>
              <th className="px-4 py-3 font-medium text-slate-600">Kol.</th>
              <th className="px-4 py-3 font-medium text-slate-600">Cijena</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Ukupno</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(order.items || []).map((item: any) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                <td className="px-4 py-3 text-slate-500">{item.sku || "-"}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.unitPrice?.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right font-medium">{item.total?.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right">
          <p className="text-sm text-slate-500">Subtotal: {order.subtotal?.toFixed(2)} €</p>
          <p className="text-sm text-slate-500">Dostava: {order.shippingTotal?.toFixed(2)} €</p>
          <p className="text-lg font-bold text-slate-900">Ukupno: {order.total?.toFixed(2)} €</p>
        </div>
      </Card>
    </div>
  );
}
