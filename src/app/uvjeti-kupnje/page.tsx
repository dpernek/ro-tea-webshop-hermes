import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uvjeti kupnje | RO-TEA",
  description:
    "Uvjeti kupnje za RO-TEA webshop. Informacije o načinima plaćanja (Stripe kartice, Apple Pay, Google Pay, virman, pouzeće), dostavi GLS/HP, cijenama, povratu u roku 14 dana i zaštiti podataka.",
  alternates: {
    canonical: "/uvjeti-kupnje",
  },
};

const sections = [
  {
    num: "1.",
    title: "Opće odredbe",
    text: "Ovi uvjeti kupnje uređuju odnos između RO-TEA d.o.o., Badalićeva 26b, 10000 Zagreb, OIB: 04533285324 (dalje: Prodavatelj) i kupca (fizičke ili pravne osobe) prilikom kupnje proizvoda putem web trgovine ro-tea.hr. Korištenjem web trgovine kupac potvrđuje da je upoznat i suglasan s ovim uvjetima.",
  },
  {
    num: "2.",
    title: "Cijene",
    text: "Sve cijene su izražene u eurima (EUR) i uključuju PDV. Cijene su informativnog karaktera te ih Prodavatelj zadržava pravo izmijeniti bez prethodne najave. Za kupca je mjerodavna cijena proizvoda u trenutku potvrde narudžbe. Akcijske cijene i popusti vrijede do isteka zaliha ili do naznačenog datuma.",
  },
  {
    num: "3.",
    title: "Naručivanje",
    text: "Narudžba se smatra sklopljenom u trenutku kada kupac zaprimi automatsku potvrdu narudžbe na svoju e-mail adresu. Potvrda se šalje s Microsoft 365 poslužitelja (info@ro-tea.hr) i sadrži pregled naručenih proizvoda, ukupni iznos i odabrani način plaćanja i dostave. Ukoliko ne zaprimite potvrdu u roku od nekoliko minuta, provjerite mapu neželjene pošte (Spam/Junk) ili nas kontaktirajte. Prodavatelj zadržava pravo otkazati narudžbu u slučaju nedostupnosti proizvoda ili pogrešno iskazane cijene, o čemu će kupac biti pravovremeno obaviješten.",
  },
  {
    num: "4.",
    title: "Plaćanje",
    text: `Kupcu su na raspolaganju sljedeći načini plaćanja:

Kartično plaćanje (Stripe) — Prihvaćamo Mastercard, Visa, Maestro, Diners i Discover kartice. Plaćanje se obrađuje putem Stripe platforme, sigurno i u skladu s PCI DSS standardom. Vaši podaci o kartici nikada se ne pohranjuju na našem poslužitelju.

Apple Pay / Google Pay — Omogućeno je plaćanje putem Apple Pay i Google Pay novčanika za verificirane korisnike. Plaćanje se također obrađuje putem Stripe platforme.

Bankovna uplata (virman / predračun) — Nakon zaprimanja narudžbe, kupac na e-mail dobiva predračun s podacima za uplatu. Narudžba se šalje nakon što uplata sjedne na račun Prodavatelja (obično 1–2 radna dana).

Pouzeće — Plaćanje pouzećem prilikom dostave kurirskom službom. Kupac plaća iznos narudžbe dostavljaču pri preuzimanju paketa. Dostupno samo za dostavu unutar Republike Hrvatske.

Sve transakcije obrađuju se u eurima (EUR). Za pravne osobe izdajemo R1 račun (vidi točku 9).`,
  },
  {
    num: "5.",
    title: "Dostava",
    text: `Dostava se vrši putem GLS-a ili Hrvatske pošte na području cijele Republike Hrvatske.

Cijena dostave: 6,64 € (PDV uključen).
Besplatna dostava: za narudžbe u vrijednosti iznad 66,36 €.
Rok isporuke: 1–3 radna dana od potvrde narudžbe (za kartično plaćanje i pouzeće), odnosno 1–3 radna dana od zaprimanja uplate (za bankovnu uplatu).

Osobno preuzimanje: moguće na adresi Badalićeva 26b, 10000 Zagreb, uz prethodni dogovor. Osobno preuzimanje je besplatno. Narudžba se priprema isti ili sljedeći radni dan.

Za dostavu izvan Republike Hrvatske molimo kontaktirajte nas na info@ro-tea.hr.`,
  },
  {
    num: "6.",
    title: "Povrat i reklamacije",
    text: (
      <>
        Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani
        raskid ugovora u roku od 14 dana od dana primitka proizvoda bez
        navođenja razloga. Proizvod mora biti vraćen nekorišten, neoštećen i u
        originalnom pakiranju. Troškove povrata snosi kupac, osim u slučaju
        greške Prodavatelja. Povrat novca izvršava se u roku od 14 dana od
        zaprimanja vraćenog proizvoda. Detaljne informacije o postupku povrata i
        reklamacijama dostupne su na stranici{" "}
        <Link
          href="/povrati-i-reklamacije"
          className="text-[#0055a8] underline hover:text-[#003d7a]"
        >
          Povrati i reklamacije
        </Link>
        .
      </>
    ),
  },
  {
    num: "7.",
    title: "Zaštita osobnih podataka",
    text: (
      <>
        Osobni podaci kupaca prikupljaju se i obrađuju isključivo u svrhu
        izvršenja narudžbe te se ne prosljeđuju trećim stranama, osim partnerima
        nužnim za realizaciju narudžbe (dostavna služba, platni procesor).
        Obrada podataka provodi se sukladno Općoj uredbi o zaštiti podataka
        (GDPR) i važećim propisima Republike Hrvatske. Više informacija
        dostupno je na stranici{" "}
        <Link
          href="/pravila-o-privatnosti"
          className="text-[#0055a8] underline hover:text-[#003d7a]"
        >
          Pravila o privatnosti
        </Link>
        .
      </>
    ),
  },
  {
    num: "8.",
    title: "Rješavanje sporova",
    text: "Svi sporovi nastali iz ovih uvjeta kupnje rješavat će se mirnim putem. U slučaju nemogućnosti sporazumnog rješenja, nadležan je sud u Zagrebu. Sukladno EU Uredbi br. 524/2013, kupci iz EU mogu sporove rješavati i putem ODR platforme dostupne na https://ec.europa.eu/consumers/odr/.",
  },
  {
    num: "9.",
    title: "R1 račun za pravne osobe",
    text: "Za pravne osobe i obrtnike izdajemo R1 račun. Prilikom narudžbe obavezno unesite podatke tvrtke (naziv, OIB) u polje za napomenu. R1 račun dostavljamo uz isporuku proizvoda ili elektroničkim putem. Za dodatne informacije kontaktirajte nas na info@ro-tea.hr.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Uvjeti kupnje
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Uvjeti pod kojima poslujemo i prodajemo proizvode putem RO-TEA
              webshopa.
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
                <div className="mt-4 text-lg leading-relaxed text-slate-600 whitespace-pre-line">
                  {s.text}
                </div>
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
