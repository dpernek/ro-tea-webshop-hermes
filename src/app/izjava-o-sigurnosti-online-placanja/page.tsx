import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Izjava o sigurnosti online plaćanja | RO-TEA",
  description:
    "Sigurnost online plaćanja u RO-TEA webshopu. Kartično plaćanje obrađuje Stripe uz PCI DSS Level 1, TLS enkripciju i 3D Secure autentifikaciju.",
  alternates: {
    canonical: "/izjava-o-sigurnosti-online-placanja",
  },
};

const sections = [
  {
    num: "1.",
    title: "Sigurnost kartičnog plaćanja",
    text: "Sigurnost Vaših podataka prilikom online plaćanja naš je najveći prioritet. Kartično plaćanje u RO-TEA webshopu u potpunosti obrađuje Stripe (stripe.com) — jedan od najpouzdanijih globalnih pružatelja usluga obrade plaćanja. RO-TEA nema pristup, ne vidi i ne pohranjuje pune podatke o Vašoj kartici, uključujući broj kartice (PAN), CVC/CVV kod niti PIN.",
  },
  {
    num: "2.",
    title: "PCI DSS Level 1 certifikacija",
    text: "Stripe posjeduje PCI DSS Level 1 certifikaciju — najvišu razinu sigurnosnog standarda u industriji platnih kartica. Ova certifikacija osigurava da se svi podaci o karticama obrađuju, prenose i pohranjuju u skladu s najstrožim sigurnosnim zahtjevima Payment Card Industry Data Security Standard-a.",
  },
  {
    num: "3.",
    title: "TLS/SSL enkripcija",
    text: "Sve transakcije između Vašeg preglednika, Stripe platforme i RO-TEA webshopa zaštićene su TLS (Transport Layer Security) i SSL enkripcijom. To znači da su svi podaci koji se razmjenjuju tijekom procesa plaćanja kriptirani i nedostupni neovlaštenim trećim stranama.",
  },
  {
    num: "4.",
    title: "3D Secure i snažna autentifikacija (SCA)",
    text: "Sva kartična plaćanja zaštićena su 3D Secure protokolom (Verified by Visa / Mastercard Identity Check), čime se osigurava snažna autentifikacija kupca (Strong Customer Authentication — SCA). Ovo je dodatni sigurnosni sloj koji potvrđuje identitet vlasnika kartice i sprječava neovlašteno korištenje kartičnih podataka.",
  },
  {
    num: "5.",
    title: "Apple Pay i Google Pay",
    text: "Putem Stripe platforme omogućeno je plaćanje putem Apple Pay i Google Pay digitalnih novčanika. Ove usluge koriste tokenizaciju — umjesto stvarnog broja kartice koristi se jedinstveni token, čime se dodatno štite Vaši platni podaci. Biometrijska autentifikacija (Face ID, Touch ID, otisak prsta) pruža dodatnu razinu sigurnosti.",
  },
  {
    num: "6.",
    title: "HTTPS na cijelom webshopu",
    text: "Cjelokupni RO-TEA webshop zaštićen je HTTPS protokolom. Sva komunikacija između Vašeg uređaja i našeg poslužitelja je kriptirana, čime se osigurava povjerljivost i integritet svih podataka koji se razmjenjuju — ne samo tijekom plaćanja, već prilikom svake interakcije s webshopom.",
  },
  {
    num: "7.",
    title: "Zaštita osobnih podataka",
    text: "Obrada osobnih podataka provodi se u skladu s Općom uredbom o zaštiti podataka (GDPR) i važećim propisima Republike Hrvatske. Detaljne informacije o obradi Vaših osobnih podataka potražite u našoj Politici privatnosti.",
  },
  {
    num: "8.",
    title: "Povezani dokumenti",
    text: "Za više informacija o uvjetima korištenja i obradi podataka, molimo pročitajte naše Uvjete kupnje i Politiku privatnosti. Ukoliko imate bilo kakvih pitanja vezanih uz sigurnost online plaćanja, slobodno nas kontaktirajte na info@ro-tea.hr.",
  },
];

export default function SigurnostPlacanjaPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">
              Izjava o sigurnosti online plaćanja
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Kako štitimo Vaše podatke prilikom online kupnje.
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
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">
              <strong>Dodatne informacije:</strong>{" "}
              <Link
                href="/pravila-o-privatnosti"
                className="text-[#0055a8] underline hover:text-[#003d7a]"
              >
                Politika privatnosti
              </Link>
              {" · "}
              <Link
                href="/uvjeti-kupnje"
                className="text-[#0055a8] underline hover:text-[#003d7a]"
              >
                Uvjeti kupnje
              </Link>
              {" · "}
              <Link
                href="/kontakt"
                className="text-[#0055a8] underline hover:text-[#003d7a]"
              >
                Kontakt
              </Link>
            </p>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Zadnja izmjena: 24. lipnja 2026.
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}
