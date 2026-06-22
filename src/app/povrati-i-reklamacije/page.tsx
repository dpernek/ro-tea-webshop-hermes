import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Povrati i reklamacije | RO-TEA",
};

export default function ReturnsPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Povrati i reklamacije
        </h1>
        <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">
            1. Povrat proizvoda
          </h2>
          <p>
            Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani
            raskid ugovora u roku od 14 dana od dana primitka proizvoda bez
            navođenja razloga.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            2. Uvjeti povrata
          </h2>
          <p>
            Proizvod mora biti vraćen neoštećen, nekorišten i u originalnom
            pakiranju sa svom pripadajućom dokumentacijom. Troškove povrata
            snosi kupac, osim ako je greška na strani prodavatelja.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            3. Povrat novca
          </h2>
          <p>
            Po zaprimanju ispravnog proizvoda, povrat novca izvršit će se u roku
            od 14 dana na račun kupca (bankovnom uplatom).
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            4. Reklamacije
          </h2>
          <p>
            Ako proizvod ima nedostatak, kupac ima pravo na reklamaciju sukladno
            Zakonu o obveznim odnosima. Reklamaciju pošaljite na info@ro-tea.hr
            s opisom nedostatka i fotografijama.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            5. Kontakt za povrate
          </h2>
          <p>
            Email: info@ro-tea.hr
            <br />
            Telefon: +385 1 3820 113
          </p>

          <p className="mt-8 text-sm text-slate-400">
            Zadnja izmjena: 22. lipnja 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
