"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CheckCircle, Package, CreditCard, Banknote, Truck } from "lucide-react";
import Link from "next/link";

const PAYMENT_LABELS: Record<string, string> = {
  card: "Kartica",
  bank_transfer: "Bankovna uplata",
  cod: "Pouzeće",
};

const PAYMENT_INSTRUCTIONS: Record<string, string> = {
  bank_transfer:
    "Račun ćemo vam poslati na e-mail. Po primitku uplate, narudžba se šalje u roku od 1-2 radna dana.",
  card:
    "Plaćanje je obrađeno putem Stripea. Potvrdu ćete dobiti na e-mail.",
  cod: "Plaćanje pouzećem prilikom dostave.",
};

function UspjehContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      // Try to get order details
      try {
        const res = await fetch(`/api/admin/orders?search=${orderNumber || ""}`);
        if (res.ok) {
          const data = await res.json();
          const found = Array.isArray(data)
            ? data.find((o: any) => o.orderNumber === orderNumber)
            : null;
          if (found) setOrder(found);
        }
      } catch {}
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber]);

  const paymentMethod = order?.paymentMethod || "bank_transfer";
  const isStripeSuccess = !!sessionId;

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              {isStripeSuccess ? "Plaćanje potvrđeno" : "Narudžba zaprimljena"}
            </h1>

            {orderNumber && (
              <p className="mt-3 text-lg font-medium text-slate-700">
                Broj narudžbe: <span className="font-mono text-[#0055a8]">{orderNumber}</span>
              </p>
            )}

            {/* Payment method + instructions */}
            <div className="mt-6 w-full max-w-sm rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                {paymentMethod === "card" && <CreditCard className="h-4 w-4" />}
                {paymentMethod === "bank_transfer" && <Banknote className="h-4 w-4" />}
                {paymentMethod === "cod" && <Truck className="h-4 w-4" />}
                {PAYMENT_LABELS[paymentMethod] || paymentMethod}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {PAYMENT_INSTRUCTIONS[paymentMethod] || ""}
              </p>
            </div>

            {order && (
              <div className="mt-4 w-full max-w-sm rounded-xl bg-green-50 p-4 text-left">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Ukupno: {order.total?.toFixed(2).replace(".", ",")} €
                  </p>
                </div>
              </div>
            )}

            <p className="mt-6 text-sm text-slate-500">
              Hvala na kupnji! Za sva pitanja slobodno nas kontaktirajte.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/proizvodi">Nastavi kupovinu</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Početna</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default function CheckoutUspjehPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055a8] border-t-transparent" />
        </div>
      }
    >
      <UspjehContent />
    </Suspense>
  );
}
