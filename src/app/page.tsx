import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PopularProducts } from "@/components/home/PopularProducts";
import { Benefits } from "@/components/home/Benefits";
import { CTASection } from "@/components/home/CTASection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RO-TEA | Profesionalni alati i oprema za industriju",
  description:
    "RO-TEA je specijalizirana trgovina profesionalnim alatima, opremom za industriju, radionice i obrtnike. PFERD, Metabo, Festa - brza dostava i stručna podrška.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RO-TEA | Profesionalni alati i oprema za industriju",
    description:
      "RO-TEA je specijalizirana trgovina profesionalnim alatima, opremom za industriju, radionice i obrtnike. PFERD, Metabo, Festa - brza dostava i stručna podrška.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <PopularProducts />

      {/* Brand credibility strip */}
      <section className="border-y border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
            Provjereni brendovi
          </p>
          <div className="flex items-center justify-center gap-12 sm:gap-20">
            <span className="text-2xl font-bold text-slate-300">PFERD</span>
            <span className="text-2xl font-bold text-slate-300">Metabo</span>
            <span className="text-2xl font-bold text-slate-300">Festa</span>
          </div>
        </div>
      </section>

      {/* B2B CTA card */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900">Poslovni kupci</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Za veleprodajne upite i posebne uvjete kontaktirajte nas
            </p>
            <a
              href="/kontakt"
              className="mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-brand px-8 text-lg font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Kontaktirajte nas
            </a>
          </div>
        </div>
      </section>

      <Benefits />
      <CTASection />
    </>
  );
}
