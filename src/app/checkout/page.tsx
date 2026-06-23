"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const [shippingOverride, setShippingOverride] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const isCanceled = searchParams.get("canceled") === "1";

  useEffect(() => {
    document.title = "Blagajna | RO-TEA";
  }, []);

  if (items.length === 0) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Blagajna</h1>
          </AnimatedSection>

          {isCanceled && (
            <AnimatedSection delay={0.05}>
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Kartično plaćanje nije dovršeno</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Vaša košarica je sačuvana. Možete pokušati ponovno ili odabrati drugi način plaćanja.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.1}>
            <EmptyState title="Košarica je prazna" description="Za nastavak checkouta potrebno je dodati barem jedan proizvod."
              action={<Button asChild size="lg"><Link href="/proizvodi">Pregledaj proizvode</Link></Button>} />
          </AnimatedSection>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Blagajna</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">Unesite podatke za dostavu i pošaljite narudžbu.</p>
        </AnimatedSection>

        {isCanceled && (
          <AnimatedSection delay={0.05}>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Kartično plaćanje nije dovršeno</p>
                <p className="mt-1 text-sm text-amber-700">
                  Vaša košarica je sačuvana. Možete pokušati ponovno ili odabrati drugi način plaćanja.
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-3 md:mt-14">
          <AnimatedSection delay={0.1} className="lg:col-span-2">
            <CheckoutForm onShippingChange={setShippingOverride} />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <CartSummary showCheckoutButton={false} shippingOverride={shippingOverride} />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055a8] border-t-transparent" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
