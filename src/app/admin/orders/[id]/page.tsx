"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

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

const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com";

function StatusTimeline({ order }: { order: any }) {
  const steps = [
    { key: "PENDING", label: "Narudžba zaprimljena", date: order.createdAt },
    { key: "CONFIRMED", label: "Potvrđeno", date: null },
    { key: "PROCESSING", label: "U obradi", date: null },
    { key: "SHIPPED", label: "Poslano", date: null },
    { key: "COMPLETED", label: "Završeno", date: null },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"];
  const currentIdx = statusOrder.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isRefunded = order.status === "REFUNDED";

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        let dotColor = "bg-slate-200";
        let lineColor = "bg-slate-200";
        let textColor = "text-slate-400";

        if (isCancelled) {
          if (idx === 0) { dotColor = "bg-slate-400"; textColor = "text-slate-600"; }
        } else if (isRefunded) {
          if (idx <= currentIdx && currentIdx >= 0) { dotColor = "bg-blue-500"; textColor = "text-blue-700"; lineColor = "bg-blue-200"; }
        } else {
          if (idx < currentIdx) { dotColor = "bg-green-500"; textColor = "text-green-700"; lineColor = "bg-green-200"; }
          else if (idx === currentIdx) { dotColor = "bg-[#0055a8] ring-4 ring-[#0055a8]/20"; textColor = "text-[#0055a8] font-semibold"; }
        }

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${dotColor}`} />
              {idx < steps.length - 1 && <div className={`w-0.5 flex-1 ${lineColor}`} />}
            </div>
            <div className={`pb-4 text-sm ${textColor}`}>
              <div>{step.label}</div>
              {step.date && (
                <div className="text-xs opacity-70">
                  {new Date(step.date).toLocaleString("hr-HR")}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </div>
          <div className="pb-4 text-sm text-red-600 font-semibold">Otkazano</div>
        </div>
      )}
      {isRefunded && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </div>
          <div className="pb-4 text-sm text-blue-600 font-semibold">Refundirano</div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [refreshingStripe, setRefreshingStripe] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then(r => r.json()).then(o => {
      setOrder(o);
      setStatus(o.status);
      setPaymentStatus(o.paymentStatus);
      setAdminNote(o.adminNote || "");
      // Mark as viewed when admin opens order detail
      if (o && !o.viewed) {
        fetch("/api/admin/orders/mark-viewed", { method: "POST", body: JSON.stringify({ ids: [id] }), headers: { "Content-Type": "application/json" } }).catch(() => {});
      }
    });
  }, [id]);

  const save = async () => {
    setSaveMessage("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, paymentStatus, adminNote }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.errors) {
      setSaveMessage(Object.values(data.errors).join(", "));
    } else {
      setSaveMessage("Promjene spremljene.");
    }
    router.refresh();
  };

  const refreshStripeStatus = async () => {
    setRefreshingStripe(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/stripe-refresh`, { method: "POST" });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setStatus(data.order.status);
        setPaymentStatus(data.order.paymentStatus);
        setSaveMessage("Stripe status osvježen.");
      } else {
        setSaveMessage(data.error || "Greška pri osvježavanju.");
      }
    } catch {
      setSaveMessage("Greška pri osvježavanju Stripe statusa.");
    } finally {
      setRefreshingStripe(false);
    }
  };

  if (!order) return <p className="p-8 text-slate-500">Učitavanje...</p>;

  const isStripe = order.paymentMethod === "card" || order.paymentMethod === "stripe";
  const hasStripeSession = !!order.stripeCheckoutSessionId;

  const paymentStatusColor: Record<string,string> = {
    UNPAID: "bg-slate-100 text-slate-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-200 text-gray-600",
    EXPIRED: "bg-orange-100 text-orange-700",
    REFUNDED: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm"><Link href="/admin/orders"><ArrowLeft className="mr-1 h-4 w-4" /> Natrag</Link></Button>
        <h1 className="text-2xl font-bold text-slate-900">Narudžba {order.orderNumber}</h1>
        {isStripe && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#635BFF] px-2.5 py-0.5 text-xs font-medium text-white">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.3 5.1c0-.7.6-1 1.5-1 .9 0 2.1.3 3 .8V2.2C10.7 1.5 9.3 1 7.8 1 5.1 1 3.2 2.5 3.2 4.9c0 3.8 5.2 3.2 5.2 4.8 0 .6-.5.8-1.4.8-1.2 0-2.7-.5-3.5-1.1v2.8c.9.4 1.8.6 2.9.6 2.8 0 4.7-1.4 4.7-3.9-.1-4.1-5.3-3.4-5.3-5z"/>
            </svg>
            Stripe
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Customer + Status + Stripe */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Podaci o kupcu</h2>
            <p className="text-sm text-slate-600"><strong>Ime:</strong> {order.customerName}</p>
            <p className="text-sm text-slate-600"><strong>Email:</strong> {order.customerEmail}</p>
            <p className="text-sm text-slate-600"><strong>Telefon:</strong> {order.customerPhone}</p>
            <p className="text-sm text-slate-600"><strong>Adresa:</strong> {order.shippingAddress || order.billingAddress || "-"}</p>
          </Card>

          {/* Stripe Info Section */}
          {isStripe && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Stripe informacije</h2>
                {hasStripeSession && (
                  <Button variant="outline" size="sm" onClick={refreshStripeStatus} disabled={refreshingStripe}>
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshingStripe ? "animate-spin" : ""}`} />
                    {refreshingStripe ? "Osvježavanje..." : "Osvježi Stripe status"}
                  </Button>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {order.stripeCheckoutSessionId && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Checkout sesija</span>
                    <a
                      href={`${STRIPE_DASHBOARD_URL}/checkout/sessions/${order.stripeCheckoutSessionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#0055a8] hover:underline"
                    >
                      {order.stripeCheckoutSessionId.slice(0, 18)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {order.stripePaymentIntentId && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Payment Intent</span>
                    <a
                      href={`${STRIPE_DASHBOARD_URL}/payments/${order.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#0055a8] hover:underline"
                    >
                      {order.stripePaymentIntentId.slice(0, 18)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {order.stripePaymentStatus && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Stripe status</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColor[order.stripePaymentStatus] || "bg-slate-100 text-slate-700"}`}>
                      {paymentLabels[order.stripePaymentStatus] || order.stripePaymentStatus}
                    </span>
                  </div>
                )}

                {order.paidAt && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Plaćeno</span>
                    <span className="text-xs text-slate-700">{new Date(order.paidAt).toLocaleString("hr-HR")}</span>
                  </div>
                )}

                {order.paymentFailedAt && (
                  <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                    <span className="text-red-600">Neuspjelo plaćanje</span>
                    <span className="text-xs text-red-700">{new Date(order.paymentFailedAt).toLocaleString("hr-HR")}</span>
                  </div>
                )}

                {order.paymentCancelledAt && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-slate-600">Otkazano plaćanje</span>
                    <span className="text-xs text-slate-700">{new Date(order.paymentCancelledAt).toLocaleString("hr-HR")}</span>
                  </div>
                )}

                {order.paymentErrorMessage && (
                  <div className="rounded-lg bg-red-50 px-3 py-2">
                    <span className="text-xs font-medium text-red-600">Greška:</span>
                    <p className="mt-0.5 text-xs text-red-700">{order.paymentErrorMessage}</p>
                  </div>
                )}

                {order.checkoutExpiresAt && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Checkout istječe</span>
                    <span className="text-xs text-slate-700">{new Date(order.checkoutExpiresAt).toLocaleString("hr-HR")}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Items */}
          <Card className="p-6">
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

        {/* Right column: Status management + Timeline */}
        <div className="space-y-6">
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
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes("Greška") ? "text-red-600" : "text-green-600"}`}>
                  {saveMessage}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Status narudžbe</h2>
            <StatusTimeline order={order} />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Detalji</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Broj narudžbe</span>
                <span className="font-mono text-slate-700">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Način plaćanja</span>
                <span className="text-slate-700">{order.paymentMethod === "card" ? "Stripe (kartica)" : order.paymentMethod === "cod" ? "Pouzeće" : order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dostava</span>
                <span className="text-slate-700">{order.shippingMethod || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kreirano</span>
                <span className="text-slate-700">{new Date(order.createdAt).toLocaleString("hr-HR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ažurirano</span>
                <span className="text-slate-700">{new Date(order.updatedAt).toLocaleString("hr-HR")}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
