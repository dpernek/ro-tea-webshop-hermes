import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti | RO-TEA",
  description: "Politika privatnosti web trgovine RO-TEA — kako prikupljamo, koristimo i štitimo vaše osobne podatke sukladno GDPR-u.",
  alternates: {
    canonical: "/politika-privatnosti",
  },
};

const sections = [
  { num: "1.", title: "Voditelj obrade", text: "RO-TEA d.o.o., Zagreb, Hrvatska\nEmail: info@ro-tea.hr\nTelefon: +385 1 3820 113" },
  { num: "2.", title: "Koje podatke prikupljamo", text: "Prilikom narudžbe prikupljamo: ime i prezime, e-mail adresu, broj telefona i adresu dostave. Svrha prikupljanja je isključivo obrada i dostava vaše narudžbe." },
  { num: "3.", title: "Kolačići", text: "Web trgovina koristi isključivo tehničke kolačiće nužne za funkcioniranje stranice (košarica, prijava u admin panel)." },
  { num: "4.", title: "Dijeljenje podataka", text: "Vaši osobni podaci neće biti dijeljeni s trećim stranama osim ako to nije potrebno za izvršenje narudžbe (dostavna služba) ili zakonsku obvezu." },
  { num: "5.", title: "Prava korisnika", text: "Imate pravo na pristup, ispravak i brisanje svojih osobnih podataka. Zahtjev možete poslati na info@ro-tea.hr." },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">Politika privatnosti</h1>
            <p className="mt-4 text-lg text-slate-500">Kako prikupljamo, koristimo i štitimo vaše osobne podatke.</p>
          </AnimatedSection>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection delay={0.1}>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.num} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-slate-900"><span className="text-[#0055a8]">{s.num}</span> {s.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600 whitespace-pre-line">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-slate-400">Zadnja izmjena: 22. lipnja 2026.</p>
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            ⚠️ Napomena: Ovo je predložak teksta (template). Prije objave web trgovine potrebno ga je pregledati i prilagoditi od strane pravne osobe.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
