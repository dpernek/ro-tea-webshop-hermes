import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Povrati i reklamacije | RO-TEA",
};

const sections = [
  {
    num: "1.",
    title: "Povrat proizvoda",
    text: "Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani raskid ugovora u roku od 14 dana od dana primitka proizvoda bez navođenja razloga.",
  },
  {
    num: "2.",
    title: "Uvjeti povrata",
    text: "Proizvod mora biti vraćen neoštećen, nekorišten i u originalnom pakiranju sa svom pripadajućom dokumentacijom. Troškove povrata snosi kupac, osim ako je greška na strani prodavatelja.",
  },
  {
    num: "3.",
    title: "Povrat novca",
    text: "Po zaprimanju ispravnog proizvoda, povrat novca izvršit će se u roku od 14 dana na račun kupca (bankovnom uplatom).",
  },
  {
    num: "4.",
    title: "Reklamacije",
    text: "Ako proizvod ima nedostatak, kupac ima pravo na reklamaciju sukladno Zakonu o obveznim odnosima. Reklamaciju pošaljite na info@ro-tea.hr s opisom nedostatka i fotografijama.",
  },
  {
    num: "5.",
    title: "Kontakt za povrate",
    text: "Email: info@ro-tea.hr\nTelefon: +385 1 3820 113",
  },
];

export default function ReturnsPage() {
  return (
    <div className="bg-slate-950">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Povrati i reklamacije</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Informacije o uvjetima povrata proizvoda i postupku reklamacije.
            </p>
          </AnimatedSection>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection delay={0.1}>
            <div className="space-y-10">
              {sections.map((s) => (
                <div key={s.num} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-white">
                    <span className="text-[#0055a8]">{s.num}</span> {s.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-300 whitespace-pre-line">{s.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-sm text-slate-500">Zadnja izmjena: 22. lipnja 2026.</p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
