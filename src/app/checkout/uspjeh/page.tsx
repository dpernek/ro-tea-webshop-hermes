"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function UspjehContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

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
            {orderNumber && (
              <p className="mt-4 text-lg font-medium text-slate-800">
                Broj narudžbe: {orderNumber}
              </p>
            )}
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
