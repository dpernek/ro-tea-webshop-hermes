"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Košarica
          </h1>
        </AnimatedSection>

        {items.length === 0 ? (
          <AnimatedSection delay={0.1}>
            <EmptyState
              title="Vaša košarica je prazna"
              description="Dodajte proizvode u košaricu i nastavite s kupnjom."
              action={
                <Button asChild size="lg">
                  <Link href="/proizvodi">Pregledaj proizvode</Link>
                </Button>
              }
            />
          </AnimatedSection>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3 md:mt-14">
            <AnimatedSection delay={0.1} className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <CartSummary showCheckoutButton />
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
}
