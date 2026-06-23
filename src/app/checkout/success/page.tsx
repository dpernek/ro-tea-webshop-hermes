"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { getOrderByStripeSessionId } from "@/lib/actions/orders";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<{
    orderNumber: string;
    paymentStatus: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      setError("Nedostaje ID sesije plaćanja.");
      return;
    }

    try {
      // Poll for the order - webhook may not have processed yet
      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 2000;

      while (attempts < maxAttempts) {
        const found = await getOrderByStripeSessionId(sessionId);
        if (found) {
          setOrder({
            orderNumber: found.orderNumber,
            paymentStatus: found.paymentStatus,
          });
          setIsLoading(false);
          return;
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
      }

      // After all attempts, show "processing" state
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Došlo je do greške prilikom dohvaćanja podataka narudžbe.");
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    clearCart();
    fetchOrder();
  }, [clearCart, fetchOrder]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
              <Loader2 className="h-10 w-10 animate-spin text-brand" />
              <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Plaćanje se obrađuje…
              </h1>
              <p className="mt-4 text-slate-600">
                Pričekajte trenutak dok potvrdimo vašu uplatu.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <span className="text-3xl">⚠️</span>
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Greška
              </h1>
              <p className="mt-4 text-slate-600">{error}</p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/">Natrag na početnu</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    );
  }

  // Payment still processing (webhook hasn't arrived)
  if (order && order.paymentStatus !== "PAID") {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Plaćanje potvrđeno
              </h1>
              {order.orderNumber && (
                <p className="mt-4 text-lg font-medium text-slate-800">
                  Broj narudžbe: {order.orderNumber}
                </p>
              )}
              <p className="mt-4 text-slate-600">
                Plaćanje se obrađuje… Obavijestit ćemo vas e-mailom kada
                narudžba bude potvrđena.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/proizvodi">Nastavi kupovinu</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    );
  }

  // Payment confirmed
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Plaćanje potvrđeno
            </h1>
            {order?.orderNumber && (
              <p className="mt-4 text-lg font-medium text-slate-800">
                Broj narudžbe: {order.orderNumber}
              </p>
            )}
            <p className="mt-4 text-slate-600">
              Hvala vam na kupnji! Uspješno ste platili karticom. Obavijestit
              ćemo vas e-mailom kada narudžba bude poslana.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/proizvodi">Nastavi kupovinu</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055a8] border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
