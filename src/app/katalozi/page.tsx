import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Katalozi | RO-TEA",
  description: "Preuzmite kataloge proizvoda - PFERD, FESTA, Metabo, Knipex i više.",
  alternates: {
    canonical: "/katalozi",
  },
  openGraph: {
    title: "Katalozi | RO-TEA",
    description: "Preuzmite kataloge proizvoda - PFERD, FESTA, Metabo, Knipex i više.",
    type: "website",
  },
};

export default async function KataloziPage() {
  const catalogs = await db.catalog.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { name: true, fileUrl: true, brand: true, description: true },
  });

  if (catalogs.length === 0) {
    return (
      <div className="bg-white">
        <div className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900">Katalozi</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">Trenutno nema dostupnih kataloga.</p>
          </div>
        </div>
      </div>
    );
  }
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
              <a href={cat.fileUrl} target="_blank" rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-50">
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-[#0055a8]/20">{cat.brand}</div>
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
