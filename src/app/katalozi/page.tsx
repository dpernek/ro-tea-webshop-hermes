import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalozi | RO-TEA",
  description: "Preuzmite kataloge proizvoda - PFERD, FESTA, Metabo, Knipex i više.",
};

const catalogs = [
  { name: "Tool Manual 2026", brand: "PFERD", description: "Kompletni pregled alata i rješenja za 2026.", image: "/images/catalogs/pferd-2026.webp", url: "https://int.pferd.com/en/service/downloads/?oxDeeplink=eyJ1bm...fX19" },
  { name: "FESTA katalog 2025–2026", brand: "FESTA", description: "Veliki izbor FESTA alata za profesionalce.", image: "/images/catalogs/festa-2025.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/FESTA-2025-2026.pdf" },
  { name: "Metabo – generalni katalog", brand: "Metabo", description: "Električni i aku alati, pribor i oprema.", image: "/images/catalogs/metabo.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/METABO-generalni-katalog.pdf" },
  { name: "Delta Plus – osnovni program", brand: "Delta Plus", description: "Osobna zaštitna oprema za profesionalce.", image: "/images/catalogs/delta-plus.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/DELTAPLUS-katalog-osnovnog-programa-1.pdf" },
  { name: "Knipex katalog", brand: "Knipex", description: "Profesionalni ručni alati i kliješta.", image: "/images/catalogs/knipex.webp", url: "https://ro-tea.hr/wp-content/uploads/2020/04/KNIPEX-katalog.pdf" },
  { name: "Dormer Pramet – Holemaking 2024", brand: "Dormer Pramet", description: "Svrdla i alati za bušenje.", image: "/images/catalogs/dormer-holemaking.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/HOLEMAKING-2024-EN.pdf" },
  { name: "Dormer Pramet – Threading 2024", brand: "Dormer Pramet", description: "Alati za izradu navoja.", image: "/images/catalogs/dormer-threading.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/THREADING-2024-EN.pdf" },
  { name: "Dormer Pramet – Maintenance & Repair 2022", brand: "Dormer Pramet", description: "Održavanje i popravci.", image: "/images/catalogs/dormer-repair.webp", url: "https://ro-tea.hr/wp-content/uploads/2025/08/DORMER-katalog-ODRZAVANJE-i-POPRAVCI-1.pdf" },
];

export default function KataloziPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold text-slate-900">Katalozi</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Preuzmite službene kataloge naših dobavljača — PFERD, FESTA, Metabo, Knipex, Dormer Pramet i Delta Plus.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {catalogs.map((cat, i) => (
            <AnimatedSection key={cat.name} delay={i * 0.05}>
              <a href={cat.url} target="_blank" rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-50">
                  <Image src={cat.image} alt={cat.name} fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" loading={i < 4 ? "eager" : "lazy"} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold tracking-wide text-[#0055a8] uppercase">{cat.brand}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-[#0055a8] transition-colors">{cat.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{cat.description}</p>
                  <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-[#0055a8]">
                    <Download className="h-4 w-4" /> Preuzmi PDF
                  </div>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
