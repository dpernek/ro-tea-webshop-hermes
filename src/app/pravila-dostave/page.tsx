import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravila dostave | RO-TEA",
  description: "Informacije o načinima dostave, rokovima isporuke i cijenama dostave za web trgovinu RO-TEA. Besplatna dostava iznad 70,00 €.",
  alternates: {
    canonical: "/pravila-dostave",
  },
};

const sections = [
  { num: "1.", title: "Načini dostave", text: "Dostava se vrši putem kurirske službe na adresu koju ste naveli prilikom narudžbe ili osobnim preuzimanjem u poslovnici (po dogovoru)." },
  { num: "2.", title: "Rok isporuke", text: "Očekivani rok isporuke je 3-7 radnih dana od potvrde narudžbe. U slučaju kašnjenja, bit ćete obaviješteni e-mailom ili telefonom." },
  { num: "3.", title: "Cijena dostave", text: "Cijena dostave kurirskom službom iznosi 8,00 € (PDV uključen). Za narudžbe iznad 70,00 € dostava je besplatna. Osobno preuzimanje u poslovnici je besplatno (po dogovoru)." },
  { num: "4.", title: "Dostupne lokacije", text: "Dostava je dostupna na području Republike Hrvatske. Za dostavu u druge države kontaktirajte nas putem e-maila." },
];

export default function ShippingRulesPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">Pravila dostave</h1>
            <p className="mt-4 text-lg text-slate-500">Informacije o načinu, roku i cijeni dostave vaših narudžbi.</p>
          </AnimatedSection>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection delay={0.1}>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.num} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-slate-900"><span className="text-[#0055a8]">{s.num}</span> {s.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-slate-400">Zadnja izmjena: 22. lipnja 2026.</p>
        </AnimatedSection>
      </div>
    </div>
  );
}
