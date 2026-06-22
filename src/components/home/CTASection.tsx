"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="from-brand flex flex-col items-center justify-between gap-8 rounded-3xl bg-gradient-to-br to-[#003d7a] p-8 text-center shadow-xl sm:p-12 lg:flex-row lg:text-left">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Spremni započeti projekt?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Pregledajte našu ponudu i pronađite opremu koja vam treba. Za
                veće količine i B2B upite stojimo vam na raspolaganju.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="text-brand shrink-0 bg-white hover:bg-blue-50"
            >
              <Link href="/proizvodi">
                Istraži ponudu
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
