import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usluga brušenja | RO-TEA",
  description: "Brušenje i obnova reznih alata - profesionalna usluga za industriju i obrtnike.",
};

const usluge = [
  "Brušenje svrdla svih dimenzija i profila",
  "Oštrenje glodala i reznih ploča",
  "Obnavljanje pila i noževa",
  "Profesionalna oprema za precizno brušenje",
  "Brza usluga uz zadržavanje kvalitete",
];

export default function UslugaBrusenjaPage() {
  return (
    <div className="bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0055a8]/10 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-[#0055a8]/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedSection>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#0055a8] uppercase">
              Profesionalna usluga
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Usluga brušenja
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300">
              Brušenje i obnova reznih alata — profesionalna usluga za
              dugotrajnu učinkovitost i preciznost u vašim proizvodnim
              procesima.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <AnimatedSection>
              <div className="space-y-5 text-lg leading-relaxed text-slate-300">
                <p>
                  RO-TEA d.o.o. pruža uslugu profesionalnog brušenja i
                  obnavljanja reznih alata. S više od 30 godina iskustva, naša
                  usluga uključuje brušenje svrdla, glodala, noževa, pila i
                  ostalih reznih alata za obradu metala, drva i drugih
                  materijala.
                </p>
                <p>
                  Korištenjem suvremenih PFERD strojeva i alata, osiguravamo
                  preciznost, dugotrajnu oštrinu i optimalne performanse vaših
                  alata — što izravno utječe na kvalitetu i učinkovitost vašeg
                  rada.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
                <h2 className="text-xl font-semibold text-white">Što nudimo</h2>
                <ul className="mt-6 space-y-4">
                  {usluge.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8">
                  <Link href="/kontakt">Zatražite ponudu</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
