import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { Wrench, Settings, Headphones } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama | RO-TEA",
  description:
    "RO-TEA d.o.o. - Više od 30 godina pouzdanih rješenja u industriji alata i opreme.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">RO-TEA d.o.o.</h1>
            <p className="mt-4 max-w-2xl text-xl text-slate-600">
              Više od 30 godina pouzdanih rješenja u industriji alata i opreme
            </p>
            <p className="mt-4 max-w-2xl text-lg text-slate-500">
              Specijalizirani partner za profesionalne alate, tehničku podršku i
              optimizaciju proizvodnih procesa.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* O tvrtki */}
        <AnimatedSection>
          <SectionTitle
            title="O tvrtki"
            subtitle="Osnovana 1990. godine sa sjedištem u Zagrebu"
          />
          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                RO-TEA d.o.o. osnovana je 1990. godine sa sjedištem u Zagrebu,
                na adresi Ulica Huga Badalića 26b. Tvrtka se više od tri
                desetljeća uspješno bavi prodajom alata i opreme te pružanjem
                rješenja za unapređenje ručne i strojne obrade u
                metaloprerađivačkoj industriji.
              </p>
              <p>
                Naš rad temelji se na stručnosti, iskustvu i individualnom
                pristupu svakom kupcu, s ciljem postizanja dugoročne
                učinkovitosti i pouzdanosti u proizvodnim procesima.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                Ključne djelatnosti
              </h3>
              <ul className="mt-6 space-y-6">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0055a8]">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Prodaja profesionalnih alata i opreme
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      za industriju, obrte i građevinski sektor
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0055a8]">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Optimizacija procesa
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Poboljšanje učinkovitosti i stabilnosti proizvodnih
                      procesa
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0055a8]">
                    <Headphones className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Tehničko savjetovanje
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Stručno savjetovanje pri odabiru alata, tehnologije i
                      načina obrade
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Partneri */}
        <AnimatedSection delay={0.1}>
          <div className="mt-20 rounded-2xl bg-slate-900 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-white">
              Naši partneri i kupci
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Dugogodišnja suradnja s uglednim tvrtkama potvrđuje kvalitetu
              našeg rada, stručnost djelatnika i pouzdanost rješenja koja
              nudimo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/proizvodi">Pogledajte ponudu</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-500 text-slate-300 hover:border-white hover:text-white"
              >
                <Link href="/kontakt">Kontaktirajte nas</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
