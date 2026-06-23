"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore(s => s.clearCart);

  const [order, setOrder] = useState<{ orderNumber: string; paymentStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearedCart, setClearedCart] = useState(false);

  useEffect(() => {
    if (!sessionId) { setLoading(false); setError("Nedostaje ID sesije."); return; }

    let attempts = 0;
    const max = 5;

    const poll = async () => {
      while (attempts < max) {
        const res = await fetch(`/api/orders/status?session_id=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orderNumber) {
            setOrder(data);
            setLoading(false);
            return;
          }
        }
        attempts++;
        if (attempts < max) await new Promise(r => setTimeout(r, 2000));
      }
      setLoading(false);
    };
    poll();
  }, [sessionId]);

  // Clear cart only when payment is confirmed PAID
  useEffect(() => {
    if (order && order.paymentStatus === "PAID" && !clearedCart) {
      clearCart();
      setClearedCart(true);
    }
  }, [order, clearedCart, clearCart]);

  if (loading) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0055a8]" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Plaćanje se obrađuje…</h1>
          <p className="mt-4 text-slate-600">Pričekajte trenutak dok potvrdimo vašu uplatu.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Narudžba nije pronađena</h1>
          <p className="mt-4 text-slate-600">Ako ste upravo završili plaćanje, pričekajte trenutak i osvježite stranicu.</p>
          <Button asChild size="lg" className="mt-8"><Link href="/">Natrag na početnu</Link></Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Narudžba nije pronađena</h1>
          <p className="mt-4 text-slate-600">Narudžba nije pronađena u sustavu. Ako ste upravo platili, pričekajte nekoliko trenutaka.</p>
          <Button asChild size="lg" className="mt-8"><Link href="/proizvodi">Nastavi kupovinu</Link></Button>
        </div>
      </div>
    );
  }

  // Webhook hasn't confirmed payment yet
  if (order.paymentStatus !== "PAID") {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0055a8]" />
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Narudžba zaprimljena</h1>
          <p className="mt-2 text-lg font-medium text-slate-700">Broj narudžbe: <span className="font-mono text-[#0055a8]">{order.orderNumber}</span></p>
          <p className="mt-4 text-slate-600">Plaćanje se obrađuje. Obavijestit ćemo vas e-mailom kada narudžba bude potvrđena.</p>
          <Button asChild size="lg" className="mt-8"><Link href="/proizvodi">Nastavi kupovinu</Link></Button>
        </div>
      </div>
    );
  }

  // Payment confirmed
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <AnimatedSection>
          <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">Plaćanje potvrđeno</h1>
            <p className="mt-4 text-lg font-medium text-slate-800">Broj narudžbe: <span className="font-mono text-[#0055a8]">{order.orderNumber}</span></p>
            <p className="mt-4 text-slate-600">Hvala vam na kupnji! Uspješno ste platili karticom. Obavijestit ćemo vas e-mailom kada narudžba bude poslana.</p>
            <Button asChild size="lg" className="mt-8"><Link href="/proizvodi">Nastavi kupovinu</Link></Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055a8] border-t-transparent" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
