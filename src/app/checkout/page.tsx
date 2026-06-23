"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const [shippingOverride, setShippingOverride] = useState<number | null>(null);

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
          <AnimatedSection delay={0.1}>
            <EmptyState
              title="Vaša košarica je prazna"
              description="Za nastavak kupnje potrebno je dodati barem jedan proizvod u košaricu."
              action={<Button asChild size="lg"><Link href="/proizvodi">Pregledajte proizvode</Link></Button>}
            />
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
