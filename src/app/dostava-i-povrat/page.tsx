import type { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Dostava i povrat | RO-TEA",
  description: "Informacije o dostavi, cijenama i povratu proizvoda kupljenih u RO-TEA webshopu.",
  alternates: { canonical: "/dostava-i-povrat" },
};

export default function DostavaPovratPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">Dostava i povrat</h1>
          </AnimatedSection>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">Dostava</h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <p>Dostava se vrši kurirskom službom na području cijele Hrvatske.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Cijena dostave:</strong> 6,64 €</li>
                <li><strong>Besplatna dostava:</strong> za narudžbe iznad 66,36 €</li>
                <li><strong>Rok isporuke:</strong> 1–3 radna dana od primitka uplate (za bankovnu uplatu) ili potvrde narudžbe (za pouzeće i kartično plaćanje)</li>
                <li><strong>Osobno preuzimanje:</strong> moguće na adresi Badalićeva 26b, 10000 Zagreb. Narudžba se priprema isti ili sljedeći radni dan. Osobno preuzimanje je besplatno.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Povrat i zamjena</h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <p>Kupac ima pravo na povrat proizvoda u roku od 14 dana od dana primitka, bez navođenja razloga.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Proizvod mora biti nekorišten, neoštećen i u originalnom pakiranju.</li>
                <li>Povrat novca izvršava se u roku od 14 dana od zaprimanja vraćenog proizvoda.</li>
                <li>Troškove povrata snosi kupac, osim u slučaju greške trgovine ili neispravnog proizvoda.</li>
                <li>Za zamjenu proizvoda kontaktirajte nas na info@ro-tea.hr ili +385 1 3820 113.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Reklamacije</h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <p>Svi proizvodi podliježu jamstvu sukladno zakonskim propisima Republike Hrvatske. U slučaju neispravnosti proizvoda, kontaktirajte nas na info@ro-tea.hr s opisom problema i brojem narudžbe.</p>
            </div>
          </section>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Napomena:</strong> Ovo je informativni tekst. Prije javnog oglašavanja potrebno ga je pregledati i prilagoditi od strane pravne osobe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
