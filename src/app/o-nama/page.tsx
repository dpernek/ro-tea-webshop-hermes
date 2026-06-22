import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Wrench, Settings, Headphones, CheckCircle, TrendingUp, Users, Award } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nama | RO-TEA",
  description: "RO-TEA d.o.o. - Više od 30 godina pouzdanih rješenja u industriji alata i opreme.",
};

const stats = [
  { icon: Award, value: "30+", label: "Godina iskustva" },
  { icon: TrendingUp, value: "1000+", label: "Proizvoda u ponudi" },
  { icon: Users, value: "3", label: "Vodeća brenda" },
];

const djelatnosti = [
  { icon: Wrench, title: "Prodaja profesionalnih alata i opreme", desc: "za industriju, obrte i građevinski sektor" },
  { icon: Settings, title: "Optimizacija procesa", desc: "Poboljšanje učinkovitosti i stabilnosti proizvodnih procesa" },
  { icon: Headphones, title: "Tehničko savjetovanje", desc: "Stručno savjetovanje pri odabiru alata, tehnologije i načina obrade" },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#0055a8] uppercase">Od 1990. godine</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">RO-TEA d.o.o.</h1>
            <p className="mt-4 max-w-2xl text-xl text-slate-600">
              Više od tri desetljeća pouzdanih rješenja u industriji alata i opreme. Specijalizirani partner za profesionalce, obrtnike i proizvodne pogone.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <stat.icon className="h-8 w-8 text-[#0055a8]" />
                  <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-slate-900">O tvrtki</h2>
            <p className="mt-2 text-lg text-slate-500">Osnovana 1990. godine sa sjedištem u Zagrebu</p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
              <p>
                RO-TEA d.o.o. osnovana je 1990. godine sa sjedištem u Zagrebu, na adresi Ulica Huga Badalića 26b. Tvrtka se više od tri desetljeća uspješno bavi prodajom alata i opreme te pružanjem rješenja za unapređenje ručne i strojne obrade u metaloprerađivačkoj industriji.
              </p>
              <p>
                Naš rad temelji se na stručnosti, iskustvu i individualnom pristupu svakom kupcu, s ciljem postizanja dugoročne učinkovitosti i pouzdanosti u proizvodnim procesima.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["PFERD", "Metabo", "Festa"].map((brand) => (
                <span key={brand} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  <CheckCircle className="h-4 w-4 text-[#0055a8]" /> {brand}
                </span>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Ključne djelatnosti</h2>
              <ul className="mt-6 space-y-5">
                {djelatnosti.map((d, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0055a8] shadow-sm">
                      <d.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{d.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{d.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.15}>
          <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0055a8] to-[#003d7a] p-10 text-center shadow-lg sm:p-14">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Naši partneri i kupci</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-blue-100">
              Dugogodišnja suradnja s uglednim tvrtkama potvrđuje kvalitetu našeg rada, stručnost djelatnika i pouzdanost rješenja koja nudimo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-[#0055a8] hover:bg-blue-50">
                <Link href="/proizvodi">Pogledajte ponudu</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:border-white hover:bg-white/10">
                <Link href="/kontakt">Kontaktirajte nas</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
