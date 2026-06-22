import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Clock, Users, Award } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama | RO-TEA",
  description:
    "RO-TEA specijalizirana trgovina tehničkom opremom. Saznajte više o našoj ponudi, vrijednostima i usluzi.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Pouzdanost",
    description:
      "Nudimo provjerene proizvode renomiranih proizvođača s garancijama.",
  },
  {
    icon: Clock,
    title: "Brzina",
    description: "Robu šaljemo u najkraćem roku i brzo odgovaramo na upite.",
  },
  {
    icon: Users,
    title: "Stručnost",
    description: "Naš tim razumije tehničku opremu i pomaže vam s odabirom.",
  },
  {
    icon: Award,
    title: "Kvaliteta",
    description:
      "Fokusirani smo na dugotrajne proizvode s odličnim omjerom cijene i kvalitete.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="O nama"
            subtitle="RO-TEA je specijalizirana trgovina profesionalnim alatima, tehničkom opremom, brusnim materijalima i priborom za industriju, radionice i obrtnike."
          />
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection delay={0.1}>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-600">
                Naša misija je jednostavna: približiti kupcima kvalitetnu
                tehničku opremu uz jasne informacije, brzu dostavu i
                profesionalnu podršku. Bilo da ste majstor, vodoinstalater,
                električar ili vlasnik domaćinstva, kod nas ćete pronaći
                proizvode prilagođene vašim potrebama.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Suradnjom s pouzdanim dobavljačima i kontinuiranim proširenjem
                ponude, nastojimo biti vaša prva adresa za tehničku robu u
                Hrvatskoj. Vjerujemo da dobra oprema čini svaki posao lakšim,
                sigurnijim i učinkovitijim.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="rounded-2xl bg-slate-50 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                Zašto nam vjerovati?
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="bg-brand mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <span>Širok asortiman proizvoda na jednom mjestu</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="bg-brand mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <span>
                    Detaljni opisi i specifikacije za jednostavan odabir
                  </span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="bg-brand mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <span>Opcije dostave i plaćanja prilagođene kupcima</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600">
                  <span className="bg-brand mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <span>Stručna pomoć pri odabiru opreme za veće projekte</span>
                </li>
              </ul>
              <Button asChild className="mt-8">
                <Link href="/proizvodi">Pogledajte ponudu</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <AnimatedSection key={value.title} delay={index * 0.08 + 0.1}>
              <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                  <value.icon className="text-brand h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
