import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravila dostave | RO-TEA",
};

export default function ShippingRulesPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Pravila dostave</h1>
        <div className="mt-8 space-y-6 leading-relaxed text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">
            1. Načini dostave
          </h2>
          <p>
            Dostava se vrši putem kurirske službe na adresu koju ste naveli
            prilikom narudžbe ili osobnim preuzimanjem u poslovnici (po
            dogovoru).
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            2. Rok isporuke
          </h2>
          <p>
            Očekivani rok isporuke je 3-7 radnih dana od potvrde narudžbe. U
            slučaju kašnjenja, bit ćete obaviješteni e-mailom ili telefonom.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            3. Cijena dostave
          </h2>
          <p>
            Cijena dostave ovisi o odabranoj metodi i izračunava se prilikom
            checkouta. Za narudžbe iznad definiranog iznosa dostava može biti
            besplatna.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">
            4. Dostupne lokacije
          </h2>
          <p>
            Dostava je dostupna na području Republike Hrvatske. Za dostavu u
            druge države kontaktirajte nas putem e-maila.
          </p>

          <p className="mt-8 text-sm text-slate-400">
            Zadnja izmjena: 22. lipnja 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
