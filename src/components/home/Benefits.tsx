"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Truck, ShieldCheck, Headphones, RotateCcw } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Brza dostava",
    description: "Robu šaljemo unutar 1-3 radna dana diljem Hrvatske.",
  },
  {
    icon: ShieldCheck,
    title: "Provjerena kvaliteta",
    description:
      "Svi proizvodi imaju garanciju i odobrenja za hrvatsko tržište.",
  },
  {
    icon: Headphones,
    title: "Stručna podrška",
    description: "Naš tim pomaže vam odabirom pravog proizvoda za vaš projekt.",
  },
  {
    icon: RotateCcw,
    title: "Jednostavna zamjena",
    description: "Reklamacije rješavamo brzo i bez dodatnih komplikacija.",
  },
];

export function Benefits() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Zašto kupovati kod nas?"
            subtitle="Prednosti koje RO-TEA nudi svojim kupcima."
            align="center"
            className="mx-auto"
          />
        </AnimatedSection>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.title} delay={index * 0.08 + 0.1}>
              <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  <benefit.icon className="text-brand h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
