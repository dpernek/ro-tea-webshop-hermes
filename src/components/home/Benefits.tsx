"use client";

import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Truck, ShieldCheck, Headphones, RotateCcw } from "lucide-react";

const icons: Record<string, any> = { Truck, ShieldCheck, Headphones, RotateCcw };

const defaultBenefits = [
  { icon: "Truck", title: "Brza dostava", description: "Robu šaljemo unutar 1-3 radna dana diljem Hrvatske." },
  { icon: "ShieldCheck", title: "Provjerena kvaliteta", description: "Svi proizvodi imaju garanciju i certifikate za hrvatsko tržište." },
  { icon: "Headphones", title: "Stručna podrška", description: "Naš tim pomaže vam odabirom pravog alata za vaš projekt." },
  { icon: "RotateCcw", title: "Jednostavna zamjena", description: "Reklamacije i povrate rješavamo brzo i bez komplikacija." },
];

interface BenefitItem { icon: string; title: string; description: string; }

export function Benefits({ title: sectionTitle, items }: { title?: string; items?: BenefitItem[] }) {
  const displayItems = items?.length ? items : defaultBenefits;

  return (
    <section className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {sectionTitle && (
          <h2 className="mb-10 text-center text-2xl font-semibold text-slate-900 sm:text-3xl">{sectionTitle}</h2>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((b, i) => {
            const Icon = icons[b.icon] || ShieldCheck;
            return (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0055a8]/10">
                    <Icon className="h-7 w-7 text-[#0055a8]" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-900">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{b.description}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
