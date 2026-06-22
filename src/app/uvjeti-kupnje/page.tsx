import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvjeti kupnje | RO-TEA",
};

const sections = [
  {
    num: "1.",
    title: "Opće odredbe",
    text: "Ovi uvjeti kupnje uređuju odnos između RO-TEA d.o.o. (dalje: Prodavatelj) i kupca (fizičke ili pravne osobe) prilikom kupnje proizvoda putem web trgovine.",
  },
  {
    num: "2.",
    title: "Cijene",
    text: "Sve cijene su izražene u eurima (EUR) i uključuju PDV. Prodavatelj zadržava pravo izmjene cijena bez prethodne najave. Cijena koja vrijedi u trenutku narudžbe je konačna cijena.",
  },
  {
    num: "3.",
    title: "Narudžba",
    text: "Narudžba se smatra sklopljenom u trenutku kada kupac zaprimi potvrdu narudžbe na svoju e-mail adresu. Prodavatelj zadržava pravo otkazati narudžbu u slučaju nedostupnosti proizvoda ili pogrešno navedene cijene.",
  },
  {
    num: "4.",
    title: "Plaćanje",
    text: "Kupac može odabrati način plaćanja: bankovnom uplatom (predračun), pouzećem prilikom dostave ili karticom (ako je omogućeno).",
  },
  {
    num: "5.",
    title: "Dostava",
    text: "Dostava se vrši putem kurirske službe ili osobnim preuzimanjem u dogovoru s prodavateljem. Rok isporuke je 3-7 radnih dana, osim ako nije drugačije dogovoreno.",
  },
  {
    num: "6.",
    title: "Povrat i reklamacije",
    text: "Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani raskid ugovora u roku od 14 dana od primitka proizvoda. Proizvod mora biti vraćen neoštećen i u originalnom pakiranju. Troškove povrata snosi kupac.",
  },
  {
    num: "7.",
    title: "Zaštita podataka",
    text: "Osobni podaci kupaca obrađuju se sukladno Politici privatnosti i važećim propisima o zaštiti podataka (GDPR).",
  },
  {
    num: "8.",
    title: "Rješavanje sporova",
    text: "Svi sporovi nastali iz ovih uvjeta rješavaju se mirnim putem, a u slučaju nemogućnosti dogovora, nadležan je sud u Zagrebu.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-slate-950">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Uvjeti kupnje</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Uvjeti pod kojima poslujemo i prodajemo naše proizvode.
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
                  <p className="mt-4 text-lg leading-relaxed text-slate-300">{s.text}</p>
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
