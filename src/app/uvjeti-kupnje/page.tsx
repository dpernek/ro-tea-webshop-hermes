import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvjeti kupnje | RO-TEA",
};

export default function TermsPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Uvjeti kupnje</h1>
        <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">
            1. Opće odredbe
          </h2>
          <p>
            Ovi uvjeti kupnje uređuju odnos između RO-TEA d.o.o. (dalje:
            Prodavatelj) i kupca (fizičke ili pravne osobe) prilikom kupnje
            proizvoda putem web trgovine ro-tea-webshop-hermes.vercel.app.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">2. Cijene</h2>
          <p>
            Sve cijene su izražene u eurima (EUR) i uključuju PDV. Prodavatelj
            zadržava pravo izmjene cijena bez prethodne najave. Cijena koja
            vrijedi u trenutku narudžbe je konačna cijena.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">3. Narudžba</h2>
          <p>
            Narudžba se smatra sklopljenom u trenutku kada kupac zaprimi potvrdu
            narudžbe na svoju e-mail adresu. Prodavatelj zadržava pravo otkazati
            narudžbu u slučaju nedostupnosti proizvoda ili pogrešno navedene
            cijene.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">4. Plaćanje</h2>
          <p>
            Kupac može odabrati način plaćanja: bankovnom uplatom (predračun),
            pouzećem prilikom dostave ili karticom (ako je omogućeno).
          </p>

          <h2 className="text-xl font-semibold text-slate-900">5. Dostava</h2>
          <p>
            Dostava se vrši putem kurirske službe ili osobnim preuzimanjem u
            dogovoru s prodavateljem. Rok isporuke je 3-7 radnih dana, osim ako
            nije drugačije dogovoreno.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            6. Povrat i reklamacije
          </h2>
          <p>
            Sukladno Zakonu o zaštiti potrošača, kupac ima pravo na jednostrani
            raskid ugovora u roku od 14 dana od primitka proizvoda. Proizvod
            mora biti vraćen neoštećen i u originalnom pakiranju. Troškove
            povrata snosi kupac.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            7. Zaštita podataka
          </h2>
          <p>
            Osobni podaci kupaca obrađuju se sukladno Politici privatnosti i
            važećim propisima o zaštiti podataka (GDPR).
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            8. Rješavanje sporova
          </h2>
          <p>
            Svi sporovi nastali iz ovih uvjeta rješavaju se mirnim putem, a u
            slučaju nemogućnosti dogovora, nadležan je sud u Zagrebu.
          </p>

          <p className="mt-8 text-sm text-slate-400">
            Zadnja izmjena: 22. lipnja 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
