import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti | RO-TEA",
};

const sections = [
  {
    num: "1.",
    title: "Voditelj obrade",
    text: "RO-TEA d.o.o., Zagreb, Hrvatska\nEmail: info@ro-tea.hr\nTelefon: +385 1 3820 113",
  },
  {
    num: "2.",
    title: "Koje podatke prikupljamo",
    text: "Prilikom narudžbe prikupljamo: ime i prezime, e-mail adresu, broj telefona i adresu dostave. Svrha prikupljanja je isključivo obrada i dostava vaše narudžbe.",
  },
  {
    num: "3.",
    title: "Kolačići",
    text: "Web trgovina koristi isključivo tehničke kolačiće nužne za funkcioniranje stranice (košarica, prijava u admin panel).",
  },
  {
    num: "4.",
    title: "Dijeljenje podataka",
    text: "Vaši osobni podaci neće biti dijeljeni s trećim stranama osim ako to nije potrebno za izvršenje narudžbe (dostavna služba) ili zakonsku obvezu.",
  },
  {
    num: "5.",
    title: "Prava korisnika",
    text: "Imate pravo na pristup, ispravak i brisanje svojih osobnih podataka. Zahtjev možete poslati na info@ro-tea.hr.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-slate-950">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Politika privatnosti</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Kako prikupljamo, koristimo i štitimo vaše osobne podatke.
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
