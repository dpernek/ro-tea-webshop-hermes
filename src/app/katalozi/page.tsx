import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FileText, Download } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalozi | RO-TEA",
  description:
    "Preuzmite kataloge proizvoda - PFERD, FESTA, Metabo, Knipex i više.",
};

const catalogs = [
  {
    name: "Tool Manual 2026",
    brand: "PFERD",
    description: "Kompletni pregled alata i rješenja za 2026.",
    url: "https://int.pferd.com/en/service/downloads/?oxDeeplink=eyJ1bml2ZXJzYWxTZWFyY2h8MSI6eyJ2aWV3IjoiZmlsdGVyZWQiLCJmaWx0ZXJzIjp7ImNvbnRlbnRUeXBlIjpbImNhdGFsb2ciXSwiY2F0ZWdvcnkiOlsiTjQ2Q05LNDE2OEFCNTFIT0k4MVM4RlVGS08iXX0sInF1ZXJ5IjoiIiwiaGlkZGVuRmlsdGVycyI6eyJicmFuZCI6WyJBSDEzSklNS0I0MDk3MDdRQUhEQUtKN1ZGUyJdfX0sIm92ZXJsYXkiOnsidHlwZSI6Im9wZW5Eb2N1bWVudCIsImFyZ3MiOnsiZG9jdW1lbnQiOiIxMDY2MjE2NCIsInF1ZXJ5IjoiIiwic2luZ2xlUGFnZSI6ZmFsc2UsImV4dGVybmFsTGlua3NFbmFibGVkIjp0cnVlLCJwYWdlIjoxfX19",
  },
  {
    name: "FESTA katalog 2025–2026",
    brand: "FESTA",
    description: "Veliki izbor FESTA alata za profesionalce.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/FESTA-2025-2026.pdf",
  },
  {
    name: "Metabo – generalni katalog",
    brand: "Metabo",
    description: "Električni i aku alati, pribor i oprema.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/METABO-generalni-katalog.pdf",
  },
  {
    name: "Delta Plus – osnovni program",
    brand: "Delta Plus",
    description: "Osobna zaštitna oprema za profesionalce.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/DELTAPLUS-katalog-osnovnog-programa-1.pdf",
  },
  {
    name: "Knipex katalog",
    brand: "Knipex",
    description: "Profesionalni ručni alati i kliješta.",
    url: "https://ro-tea.hr/wp-content/uploads/2020/04/KNIPEX-katalog.pdf",
  },
  {
    name: "Dormer Pramet – Holemaking 2024",
    brand: "Dormer Pramet",
    description: "Svrdla i alati za bušenje.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/HOLEMAKING-2024-EN.pdf",
  },
  {
    name: "Dormer Pramet – Threading 2024",
    brand: "Dormer Pramet",
    description: "Alati za izradu navoja.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/THREADING-2024-EN.pdf",
  },
  {
    name: "Dormer Pramet – Maintenance & Repair 2022",
    brand: "Dormer Pramet",
    description: "Održavanje i popravci.",
    url: "https://ro-tea.hr/wp-content/uploads/2025/08/DORMER-katalog-ODRZAVANJE-i-POPRAVCI-1.pdf",
  },
];

export default function KataloziPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">Katalozi</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Preuzmite službene kataloge naših dobavljača — PFERD, FESTA,
              Metabo, Knipex i više.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalogs.map((cat, i) => (
            <AnimatedSection key={cat.name} delay={i * 0.05}>
              <a
                href={cat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0055a8]/10">
                  <FileText className="h-6 w-6 text-[#0055a8]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#0055a8]">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#0055a8]">
                  {cat.brand}
                </p>
                <p className="mt-2 text-sm text-slate-600">{cat.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0055a8]">
                  <Download className="h-4 w-4" />
                  Preuzmi katalog
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
