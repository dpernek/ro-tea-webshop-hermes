import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jednostrani raskid ugovora | RO-TEA",
  description:
    "Obrazac za jednostrani raskid ugovora sklopljenog na daljinu. Pravo na raskid u roku od 14 dana bez navođenja razloga, sukladno Zakonu o zaštiti potrošača.",
  alternates: {
    canonical: "/jednostrani-raskid-ugovora",
  },
};

const sections = [
  {
    num: "1.",
    title: "Pravo na jednostrani raskid ugovora",
    text: "Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani raskid ugovora sklopljenog na daljinu u roku od 14 dana od dana primitka proizvoda, bez navođenja razloga.",
  },
  {
    num: "2.",
    title: "Način dostave obavijesti o raskidu",
    text: "Obavijest o raskidu ugovora kupac dostavlja pisano, putem elektroničke pošte (e-mail) ili poštom. Obavijest mora sadržavati podatke o kupcu, broj narudžbe i jasno izraženu namjeru raskida ugovora.",
  },
  {
    num: "3.",
    title: "Troškovi povrata",
    text: "Troškove povrata proizvoda snosi kupac, osim u slučaju greške prodavatelja ili neispravnog proizvoda. Proizvod mora biti vraćen nekorišten, neoštećen i u originalnom pakiranju sa svom pripadajućom dokumentacijom.",
  },
  {
    num: "4.",
    title: "Povrat novca",
    text: "Povrat novca izvršit će se u roku od 14 dana od zaprimanja vraćenog proizvoda. Iznos se vraća na IBAN kupca naveden u obrascu za raskid ugovora.",
  },
  {
    num: "5.",
    title: "Kontakt",
    text: "Obavijest o raskidu ugovora pošaljite na e-mail adresu: info@ro-tea.hr. Proizvod s priloženim obrascem pošaljite na adresu: RO-TEA d.o.o., Badalićeva 26b, 10000 Zagreb.",
  },
];

export default function JednostraniRaskidUgovoraPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Jednostrani raskid ugovora
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Informacije o pravu na jednostrani raskid ugovora sklopljenog na
              daljinu i obrazac za raskid.
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

          {/* Obrazac za jednostrani raskid ugovora — informativni prikaz */}
          <div className="mt-12 rounded-xl border-2 border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Obrazac za jednostrani raskid ugovora
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Ovaj obrazac je informativnog karaktera. Ispunite ga i pošaljite
              zajedno s proizvodom na našu adresu.
            </p>

            <div className="space-y-6">
              {/* Ime i prezime */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ime i prezime
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                  ________________________________________
                </div>
              </div>

              {/* Adresa */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresa
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                  ________________________________________
                </div>
              </div>

              {/* Broj narudžbe */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Broj narudžbe
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                  ________________________________________
                </div>
              </div>

              {/* Datum narudžbe i Datum primitka — dva stupca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Datum narudžbe
                  </label>
                  <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                    ____________________
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Datum primitka
                  </label>
                  <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                    ____________________
                  </div>
                </div>
              </div>

              {/* Proizvod(i) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Proizvod(i)
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[88px]">
                  ________________________________________
                  <br />
                  ________________________________________
                  <br />
                  ________________________________________
                </div>
              </div>

              {/* IBAN za povrat */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  IBAN za povrat
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                  ________________________________________
                </div>
              </div>

              {/* Potpis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Potpis
                </label>
                <div className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-400 text-sm min-h-[44px]">
                  ________________________________________
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Zadnja izmjena: 24. lipnja 2026.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
