import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pravila o privatnosti | RO-TEA",
  description: "Pravila o privatnosti RO-TEA webshopa. Kako prikupljamo, obrađujemo i štitimo vaše osobne podatke sukladno GDPR-u. Informacije o kolačićima, Stripe plaćanju i pravima ispitanika.",
  alternates: {
    canonical: "/pravila-o-privatnosti",
  },
};

const sections = [
  {
    num: "1.",
    title: "Voditelj obrade podataka",
    text: "Voditelj obrade vaših osobnih podataka je RO-TEA d.o.o., Badalićeva 26b, 10000 Zagreb, OIB: 82282361229, e-mail: info@ro-tea.hr, telefon: +385 1 3820 113 (dalje: RO-TEA ili \"mi\").",
  },
  {
    num: "2.",
    title: "Koje podatke prikupljamo",
    text: "Prilikom korištenja naše web trgovine prikupljamo sljedeće kategorije osobnih podataka:\n\n• Podaci o kupcu: ime, prezime, naziv tvrtke (za pravne osobe), OIB (za R1 račun), e-mail adresa, broj telefona, adresa za dostavu i adresa za račun.\n\n• Podaci o narudžbi: proizvodi u košarici, odabrani način plaćanja i dostave, povijest narudžbi, status narudžbe.\n\n• Podaci o plaćanju: kod kartičnog plaćanja putem Stripea, podatke o kartici obrađuje isključivo Stripe na svojim sigurnim poslužiteljima. RO-TEA nikada ne pohranjuje niti ima uvid u broj vaše kartice, CVV ili druge osjetljive kartične podatke.\n\n• Tehnički podaci: IP adresa, vrsta preglednika, operativni sustav, vrijeme pristupa i obrasci ponašanja na stranici (putem kolačića i alata za analitiku).",
  },
  {
    num: "3.",
    title: "Svrha obrade podataka",
    text: "Vaše osobne podatke obrađujemo u sljedeće svrhe:\n\n• Izvršenje narudžbe — obrada, pakiranje i dostava naručenih proizvoda, uključujući slanje potvrde narudžbe i računa na vašu e-mail adresu.\n\n• Komunikacija — odgovaranje na upite poslane putem kontakt obrasca, e-maila (info@ro-tea.hr) ili telefona, te obavještavanje o statusu narudžbe.\n\n• Upravljanje narudžbama — vođenje evidencije narudžbi u našem administrativnom sustavu (Supabase/Prisma backend) radi ispunjavanja zakonskih obveza i pružanja podrške.\n\n• Pravne obveze — izdavanje računa (članak 78. i 79. Zakona o PDV-u), čuvanje računovodstvene dokumentacije (11 godina) i postupanje po zahtjevima za povrat/reklamaciju.\n\n• Poboljšanje usluge — analiza anonimiziranih podataka o korištenju web stranice u svrhu optimizacije korisničkog iskustva.",
  },
  {
    num: "4.",
    title: "Pravna osnova obrade",
    text: "Osobne podatke obrađujemo na temelju sljedećih pravnih osnova iz članka 6. GDPR-a:\n\n• Izvršenje ugovora (čl. 6. st. 1. točka b) — obrada nužna za ispunjenje narudžbe i dostavu proizvoda.\n\n• Zakonska obveza (čl. 6. st. 1. točka c) — čuvanje računa i poslovne dokumentacije sukladno poreznim propisima.\n\n• Legitimni interes (čl. 6. st. 1. točka f) — odgovaranje na upite kupaca, optimizacija web stranice i sprječavanje zlouporabe.\n\n• Privola (čl. 6. st. 1. točka a) — za marketing e-mailove i određene vrste kolačića (putem cookie consent bannera). Privolu možete povući u bilo kojem trenutku.",
  },
  {
    num: "5.",
    title: "Kolačići (Cookies)",
    text: "Naša web stranica koristi kolačiće za ispravan rad, analitiku i poboljšanje korisničkog iskustva. Prilikom prvog posjeta prikazuje vam se cookie consent banner putem kojeg možete prihvatiti ili odbiti pojedine kategorije kolačića.\n\n• Nužni kolačići — potrebni za funkcioniranje košarice, prijavu i checkout proces. Bez njih web trgovina ne može ispravno raditi.\n\n• Analitički kolačići — koriste se za anonimno praćenje posjećenosti i ponašanja korisnika. Aktiviraju se samo uz vašu privolu.\n\n• Marketinški kolačići — koriste se za prikaz relevantnih oglasa. Aktiviraju se samo uz vašu privolu.\n\nPostavke kolačića možete u bilo kojem trenutku promijeniti putem linka \"Postavke kolačića\" u podnožju stranice. Više o kolačićima možete saznati na www.allaboutcookies.org.",
  },
  {
    num: "6.",
    title: "E-mail komunikacija (Microsoft 365)",
    text: "Sva e-mail komunikacija s kupcima odvija se putem Microsoft 365 platforme, uključujući slanje potvrda narudžbi, računa, obavijesti o statusu narudžbe i odgovora na upite. Microsoft 365 je usklađen s GDPR-om i pruža enkripciju podataka u prijenosu i mirovanju.\n\nE-mail poruke koje sadrže osobne podatke ob obradi narudžbe (npr. potvrda narudžbe s podacima o kupcu) šalju se putem Microsoft Graph API-ja. Pristup e-mail sandučiću info@ro-tea.hr zaštićen je višefaktorskom autentifikacijom.",
  },
  {
    num: "7.",
    title: "Dijeljenje podataka s trećim stranama",
    text: "Vaše osobne podatke dijelimo samo s pouzdanim partnerima koji su nužni za izvršenje narudžbe:\n\n• Stripe — za procesiranje kartičnih plaćanja. Stripe je certificiran prema PCI DSS Level 1 standardu i obrađuje podatke o kartici na svojim sigurnim poslužiteljima. RO-TEA nema pristup cjelovitim podacima o kartici.\n\n• Dostavne službe — kurirske službe kojima prosljeđujemo ime, adresu i kontakt telefon isključivo u svrhu dostave vaše narudžbe.\n\n• Računovodstveni servis — za potrebe izdavanja i knjiženja računa.\n\n• Supabase — hosting platforma za našu bazu podataka (PostgreSQL) koja pohranjuje podatke o narudžbama i kupcima. Supabase poslužitelji nalaze se unutar Europske unije.\n\nSvi partneri ugovorno su obvezni čuvati povjerljivost vaših podataka i obrađivati ih isključivo prema našim uputama.",
  },
  {
    num: "8.",
    title: "Razdoblje čuvanja podataka",
    text: "Osobne podatke čuvamo samo onoliko dugo koliko je potrebno za svrhu za koju su prikupljeni:\n\n• Podaci o narudžbama i računi — 11 godina (sukladno Zakonu o računovodstvu i Zakonu o PDV-u).\n\n• Podaci o kupcima bez narudžbi — do povlačenja privole ili najviše 3 godine od posljednje interakcije.\n\n• Podaci iz kontakt upita — 1 godinu od rješavanja upita.\n\n• Kolačići — sukladno roku trajanja pojedinog kolačića (najviše 2 godine).\n\nNakon isteka roka čuvanja podaci se trajno brišu ili anonimiziraju.",
  },
  {
    num: "9.",
    title: "Vaša prava",
    text: "Kao ispitanik, imate sljedeća prava prema GDPR-u:\n\n• Pravo na pristup — možete zatražiti informaciju o tome koje osobne podatke o vama obrađujemo i kopiju tih podataka.\n\n• Pravo na ispravak — možete zatražiti ispravak netočnih ili dopunu nepotpunih podataka.\n\n• Pravo na brisanje (\"pravo na zaborav\") — možete zatražiti brisanje podataka ako više nisu potrebni za svrhu obrade ili ako povučete privolu.\n\n• Pravo na ograničenje obrade — možete zatražiti ograničenje obrade vaših podataka u određenim slučajevima.\n\n• Pravo na prenosivost — možete zatražiti prijenos vaših podataka drugom voditelju obrade u strukturiranom, strojno čitljivom formatu.\n\n• Pravo na prigovor — možete uložiti prigovor na obradu vaših podataka.\n\nZa ostvarivanje navedenih prava kontaktirajte nas na info@ro-tea.hr. Odgovorit ćemo u roku od 30 dana.\n\nTakođer imate pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP), Selska cesta 136, 10000 Zagreb, e-mail: azop@azop.hr.",
  },
  {
    num: "10.",
    title: "Sigurnost podataka",
    text: "Poduzimamo odgovarajuće tehničke i organizacijske mjere zaštite osobnih podataka:\n\n• Enkripcija — svi podaci između vašeg preglednika i naših poslužitelja prenose se putem HTTPS protokola (TLS enkripcija).\n\n• Sigurnost plaćanja — kartična plaćanja procesiraju se isključivo putem Stripea, koji posjeduje PCI DSS Level 1 certifikat (najviši sigurnosni standard za kartična plaćanja). Više informacija na našoj stranici Izjava o sigurnosti online plaćanja.\n\n• Sigurnost baze podataka — podaci se pohranjuju na Supabase platformi s enkripcijom u mirovanju, redovitim sigurnosnim kopijama i kontrolom pristupa.\n\n• Autentifikacija — pristup administrativnom sučelju (backend za upravljanje narudžbama) zaštićen je sigurnosnim lozinkama i ograničen na ovlaštene djelatnike RO-TEA.\n\n• Minimalni pristup — pristup osobnim podacima imaju samo djelatnici kojima su ti podaci nužni za obavljanje posla.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Pravila o privatnosti
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Kako prikupljamo, obrađujemo i štitimo vaše osobne podatke sukladno
              Općoj uredbi o zaštiti podataka (GDPR).
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

          <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">
              Povezane stranice
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>
                <Link
                  href="/uvjeti-kupnje"
                  className="text-[#0055a8] hover:underline"
                >
                  Uvjeti kupovine
                </Link>
                {" "}— opći uvjeti poslovanja
              </li>
              <li>
                <Link
                  href="/izjava-o-sigurnosti-online-placanja"
                  className="text-[#0055a8] hover:underline"
                >
                  Izjava o sigurnosti online plaćanja
                </Link>
                {" "}— detalji o Stripe kartičnom plaćanju
              </li>
              <li>
                <Link
                  href="/povrati-i-reklamacije"
                  className="text-[#0055a8] hover:underline"
                >
                  Povrati i reklamacije
                </Link>
                {" "}— postupak povrata i reklamacije
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-[#0055a8] hover:underline"
                >
                  Kontakt
                </Link>
                {" "}— kontaktirajte nas za pitanja o privatnosti
              </li>
            </ul>
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Zadnja izmjena: 24. lipnja 2026.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
