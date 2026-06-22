import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti | RO-TEA",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Politika privatnosti
        </h1>
        <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">
            1. Voditelj obrade
          </h2>
          <p>
            RO-TEA d.o.o., Zagreb, Hrvatska
            <br />
            Email: info@ro-tea.hr
            <br />
            Telefon: +385 1 3820 113
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            2. Koje podatke prikupljamo
          </h2>
          <p>
            Prilikom narudžbe prikupljamo: ime i prezime, e-mail adresu, broj
            telefona i adresu dostave. Svrha prikupljanja je isključivo obrada i
            dostava vaše narudžbe.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">3. Kolačići</h2>
          <p>
            Web trgovina koristi isključivo tehničke kolačiće nužne za
            funkcioniranje stranice (košarica, prijava u admin panel).
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            4. Dijeljenje podataka
          </h2>
          <p>
            Vaši osobni podaci neće biti dijeljeni s trećim stranama osim ako to
            nije potrebno za izvršenje narudžbe (dostavna služba) ili zakonsku
            obvezu.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            5. Prava korisnika
          </h2>
          <p>
            Imate pravo na pristup, ispravak i brisanje svojih osobnih podataka.
            Zahtjev možete poslati na info@ro-tea.hr.
          </p>

          <p className="mt-8 text-sm text-slate-400">
            Zadnja izmjena: 22. lipnja 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
