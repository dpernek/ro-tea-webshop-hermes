import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Wrench, Settings, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usluga brušenja | RO-TEA",
  description:
    "Brušenje i obnova reznih alata - profesionalna usluga za industriju i obrtnike.",
};

export default function UslugaBrusenjaPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Usluga brušenja
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-slate-600">
              Brušenje i obnova reznih alata
            </p>
            <p className="mt-4 max-w-2xl text-lg text-slate-500">
              Profesionalna usluga brušenja i obnavljanja reznih alata za
              dugotrajnu učinkovitost i preciznost u vašim proizvodnim
              procesima.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                RO-TEA d.o.o. pruža uslugu profesionalnog brušenja i obnavljanja
                reznih alata. S više od 30 godina iskustva, naša usluga
                uključuje brušenje svrdla, glodala, noževa, pila i ostalih
                reznih alata za obradu metala, drva i drugih materijala.
              </p>
              <p>
                Korištenjem suvremenih PFERD strojeva i alata, osiguravamo
                preciznost, dugotrajnu oštrinu i optimalne performanse vaših
                alata — što izravno utječe na kvalitetu i učinkovitost vašeg
                rada.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                Što nudimo
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Brušenje svrdla svih dimenzija i profila",
                  "Oštrenje glodala i reznih ploča",
                  "Obnavljanje pila i noževa",
                  "Profesionalna oprema za precizno brušenje",
                  "Brza usluga uz zadržavanje kvalitete",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link href="/kontakt">Zatražite ponudu</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
