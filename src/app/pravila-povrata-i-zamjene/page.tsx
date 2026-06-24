import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravila povrata i zamjene | RO-TEA",
  description:
    "Pravila povrata, zamjene i reklamacije proizvoda kupljenih u RO-TEA webshopu. Povrat u roku 14 dana, reklamacija materijalnih nedostataka i EU ODR platforma.",
  alternates: {
    canonical: "/pravila-povrata-i-zamjene",
  },
};

const sections = [
  {
    num: "1.",
    title: "Pravo na povrat",
    text: "Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani raskid ugovora u roku od 14 dana od dana primitka proizvoda bez navođenja razloga.",
  },
  {
    num: "2.",
    title: "Uvjeti povrata",
    text: "Proizvod mora biti vraćen nekorišten, neoštećen i u originalnom pakiranju sa svom pripadajućom dokumentacijom. Troškove povrata snosi kupac, osim u slučaju greške na strani prodavatelja. Povrat novca izvršava se u roku od 14 dana od zaprimanja vraćenog proizvoda, na račun kupca.",
  },
  {
    num: "3.",
    title: "Zamjena proizvoda",
    text: "Kupac može zatražiti zamjenu proizvoda za drugi proizvod u roku od 15 dana od dana primitka. Proizvod za zamjenu mora biti nekorišten, neoštećen i u originalnom pakiranju. Razliku u cijeni kupac doplaćuje, odnosno prodavatelj vraća. Zahtjev za zamjenu pošaljite na info@ro-tea.hr s brojem narudžbe.",
  },
  {
    num: "4.",
    title: "Reklamacija proizvoda",
    text: "Prodavatelj odgovara za materijalne nedostatke proizvoda sukladno Zakonu o obveznim odnosima. Kupac ima pravo na reklamaciju u roku od 15 dana od dana primitka proizvoda. Reklamaciju pošaljite na info@ro-tea.hr s detaljnim opisom nedostatka, fotografijama i brojem narudžbe. Po zaprimanju reklamacije, prodavatelj će u najkraćem mogućem roku provjeriti opravdanost reklamacije i ponuditi zamjenu, popravak ili povrat novca.",
  },
  {
    num: "5.",
    title: "ODR platforma",
    text: "Sukladno EU Uredbi br. 524/2013, potrošači iz Europske unije imaju mogućnost rješavanja sporova iz online kupnje putem ODR (Online Dispute Resolution) platforme Europske komisije. Platforma je dostupna na sljedećoj poveznici: https://ec.europa.eu/consumers/odr/.",
  },
  {
    num: "6.",
    title: "Kontakt za povrate i reklamacije",
    text: "Za sva pitanja vezana uz povrate, zamjene i reklamacije kontaktirajte nas:\n\nEmail: info@ro-tea.hr\nTelefon: +385 1 3820 113\nAdresa: RO-TEA d.o.o., Badalićeva 26b, 10000 Zagreb",
  },
];

export default function ReturnAndExchangeRulesPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Pravila povrata i zamjene
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Informacije o uvjetima povrata, zamjene i reklamacije proizvoda.
            </p>
          </AnimatedSection>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection delay={0.1}>
          <div className="space-y-10">
            {sections.map((s) => (
              <div
                key={s.num}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  <span className="text-[#0055a8]">{s.num}</span> {s.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600 whitespace-pre-line">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-slate-400">
            Zadnja izmjena: 24. lipnja 2026.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
