"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
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
      "Svi proizvodi imaju garanciju i certifikate za hrvatsko tržište.",
  },
  {
    icon: Headphones,
    title: "Stručna podrška",
    description: "Naš tim pomaže vam odabirom pravog alata za vaš projekt.",
  },
  {
    icon: RotateCcw,
    title: "Jednostavna zamjena",
    description: "Reklamacije i povrate rješavamo brzo i bez komplikacija.",
  },
];

export function Benefits() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-10 text-center md:mb-14">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Zašto RO-TEA?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-400">
              Prednosti koje nudimo svojim kupcima.
            </p>
          </div>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.title} delay={index * 0.08 + 0.1}>
              <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50 p-8 transition-all hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-800">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#0055a8]/20 to-cyan-500/10 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0055a8] shadow-lg shadow-blue-900/30">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
