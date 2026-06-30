"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  CheckCircle, CreditCard, Banknote, Truck, AlertCircle,
  MapPin, ShoppingBag, TicketPercent, ExternalLink, Loader2,
} from "lucide-react";
import Link from "next/link";

const PAYMENT_LABELS: Record<string, string> = { card: "Kartica", bank_transfer: "Bankovna uplata", cod: "Pouzeće" };
const PAYMENT_INSTRUCTIONS: Record<string, string> = {
  card: "Plaćanje je obrađeno putem Stripea. Potvrdu ćete dobiti na e-mail.",
  bank_transfer: "Račun ćemo vam poslati na e-mail. Po primitku uplate, narudžba se šalje u roku od 1-2 radna dana.",
  cod: "Plaćanje pouzećem prilikom preuzimanja pošiljke.",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Na čekanju", CONFIRMED: "Potvrđeno", PROCESSING: "U obradi",
  SHIPPED: "Poslano", COMPLETED: "Završeno", CANCELLED: "Otkazano", REFUNDED: "Refundirano",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Nije plaćeno", PENDING: "Plaćanje u tijeku", PAID: "Plaćeno",
  FAILED: "Neuspjelo", CANCELLED: "Otkazano", EXPIRED: "Isteklo", REFUNDED: "Refundirano",
};

function formatPrice(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

function UspjehContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderNumber && !sessionId) { setLoading(false); setError(true); return; }
    const param = sessionId ? `session_id=${encodeURIComponent(sessionId)}` : `orderNumber=${encodeURIComponent(orderNumber!)}`;
    fetch(`/api/orders/status?${param}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (data.orderNumber) setOrder(data); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderNumber, sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0055a8]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h1 className="mt-4 text-xl font-bold text-slate-900">Narudžba nije pronađena</h1>
            <p className="mt-2 text-slate-500">Ako ste upravo završili plaćanje, pričekajte trenutak i osvježite stranicu.</p>
            <Button asChild size="lg" className="mt-6"><Link href="/proizvodi">Nastavi kupovinu</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethod = order.paymentMethod || "bank_transfer";
  const isPaid = order.paymentStatus === "PAID";
  const shippingMethod = order.shippingMethod || "";
  const isGls = shippingMethod.startsWith("GLS");
  const isPaketomat = shippingMethod === "GLS Paketomat";
  const isPickup = shippingMethod.toLowerCase().includes("osobno") || shippingMethod.toLowerCase().includes("preuzimanje");
  const hasTracking = isGls && order.glsParcelNumber;

  // Build full shipping address for home delivery
  const shippingAddr = order.shippingAddress ? `${order.shippingAddress}, ${order.postalCode || ""} ${order.city || ""}`.trim() : order.shippingAddress;

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

            {/* ── Header ── */}
            <div className="text-center">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? "bg-green-50" : "bg-blue-50"}`}>
                <CheckCircle className={`h-9 w-9 ${isPaid ? "text-green-600" : "text-blue-500"}`} />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                {isPaid ? "Plaćanje potvrđeno" : "Narudžba zaprimljena"}
              </h1>
              <p className="mt-2 text-lg font-medium text-slate-700">
                Broj narudžbe: <span className="font-mono text-[#0055a8]">{order.orderNumber}</span>
              </p>
            </div>

            {/* ── Status badges ── */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {STATUS_LABELS[order.status] || order.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isPaid ? "bg-green-100 text-green-700" : order.paymentStatus === "UNPAID" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
              </span>
            </div>

            {/* ── Payment method ── */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                {paymentMethod === "card" && <CreditCard className="h-4 w-4 text-blue-600" />}
                {paymentMethod === "bank_transfer" && <Banknote className="h-4 w-4 text-emerald-600" />}
                {paymentMethod === "cod" && <Truck className="h-4 w-4 text-orange-600" />}
                {PAYMENT_LABELS[paymentMethod] || paymentMethod}
              </div>
              <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-500">
                {PAYMENT_INSTRUCTIONS[paymentMethod] || ""}
              </p>
            </div>

            {/* ── Delivery info ── */}
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" /> Dostava
              </h3>
              <div className="space-y-1.5 text-sm text-slate-600">
                <p><span className="text-slate-400">Način:</span> {shippingMethod}</p>

                {isPaketomat && (
                  <>
                    <p><span className="text-slate-400">Paketomat:</span> {order.glsPickupPointName || "—"}</p>
                    <p className="text-xs text-slate-400">{order.glsPickupPointAddress || ""}</p>
                  </>
                )}

                {!isPaketomat && !isPickup && shippingAddr && (
                  <p className="text-xs text-slate-400">{shippingAddr}</p>
                )}

                {isPickup && (
                  <p className="text-xs text-slate-500">Narudžbu preuzimate osobno u poslovnici.</p>
                )}
              </div>

              {/* ── GLS tracking ── */}
              {isGls && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  {hasTracking ? (
                    <a
                      href={`https://gls-group.eu/HR/hr/pracenje-posiljaka?match=${order.glsParcelNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Pratite pošiljku: {order.glsParcelNumber}
                    </a>
                  ) : (
                    <p className="text-xs text-blue-600">
                      Broj za praćenje bit će dostupan nakon kreiranja pošiljke.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Items ── */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-slate-400" /> Artikli
                </h3>
                <div className="space-y-2">
                  {order.orderItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.productName} × {item.quantity}</span>
                      <span className="font-medium text-slate-800">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Financial breakdown ── */}
            <div className="mt-5 border-t-2 border-slate-200 pt-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Međuzbroj</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dostava</span>
                  <span>{order.shippingTotal > 0 ? formatPrice(order.shippingTotal) : "Besplatno"}</span>
                </div>
                {order.couponCode && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <TicketPercent className="h-3.5 w-3.5" />
                      Kupon {order.couponCode}
                    </span>
                    <span>−{formatPrice(order.couponDiscount || 0)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
                <span className="text-base font-semibold text-slate-900">Ukupno</span>
                <span className="text-xl font-bold text-slate-900">{formatPrice(order.total || 0)}</span>
              </div>
            </div>

            {/* ── Footer ── */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Hvala na kupnji! Za sva pitanja slobodno nas kontaktirajte.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><Link href="/proizvodi">Nastavi kupovinu</Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/">Početna</Link></Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default function CheckoutUspjehPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0055a8]" />
      </div>
    }>
      <UspjehContent />
    </Suspense>
  );
}
