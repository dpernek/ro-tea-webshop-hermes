"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionTitle title="Checkout" />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <EmptyState
              title="Košarica je prazna"
              description="Za nastavak checkouta potrebno je dodati barem jedan proizvod."
              action={
                <Button asChild size="lg">
                  <Link href="/proizvodi">Pregledaj proizvode</Link>
                </Button>
              }
            />
          </AnimatedSection>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Narudžba zaprimljena
              </h1>
              <p className="mt-4 text-slate-600">
                Hvala vam na povjerenju. Kontaktirat ćemo vas u najkraćem
                mogućem roku s potvrdom narudžbe i detaljima dostave.
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

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Checkout"
            subtitle="Unesite podatke za dostavu i pošaljite narudžbu."
          />
        </AnimatedSection>

        <div className="grid gap-8 lg:grid-cols-3">
          <AnimatedSection delay={0.1} className="lg:col-span-2">
            <CheckoutForm onSuccess={() => setSuccess(true)} />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <CartSummary showCheckoutButton={false} />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
