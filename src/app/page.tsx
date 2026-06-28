import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PopularProducts } from "@/components/home/PopularProducts";
import { Benefits } from "@/components/home/Benefits";
import { CTASection } from "@/components/home/CTASection";
import Image from "next/image";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "RO-TEA | Profesionalni alati i oprema za industriju i obrt",
  description:
    "RO-TEA d.o.o. — specijalizirana trgovina profesionalnim alatima i opremom za industriju, radionice i obrtnike. Brusni alati, zaštitna oprema, ručni alat, električni alati. PFERD, Metabo, Festa — brza dostava i stručna podrška.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RO-TEA | Profesionalni alati i oprema za industriju i obrt",
    description:
      "RO-TEA d.o.o. — specijalizirana trgovina profesionalnim alatima i opremom za industriju, radionice i obrtnike. Brusni alati, zaštitna oprema, ručni alat, električni alati. PFERD, Metabo, Festa — brza dostava i stručna podrška.",
    type: "website",
  },
};

const targetAudience = [
  {
    title: "Kućni majstori",
    description: "Alati i oprema za popravke, renovacije i kućne radionice.",
  },
  {
    title: "Obrti",
    description: "Rješenja za svakodnevne profesionalne zadatke u obrtu.",
  },
  {
    title: "Tvrtke",
    description: "Industrijska oprema i alati za proizvodne pogone i skladišta.",
  },
  {
    title: "Održavanje i servisi",
    description: "Specijalizirani alati za servisere i timove za održavanje.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* hero content: server-loaded */}
      <div id="hero"><Hero /></div>

      <div id="kategorije"><FeaturedCategories /></div>

      {/* Target audience: Za koga je RO-TEA */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Za koga je RO-TEA
          </h2>
          <p className="mt-3 text-center text-slate-600">
            Bez obzira na veličinu projekta – imamo rješenje za vas.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {targetAudience.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="popularno"><PopularProducts /></div>

      {/* Brand credibility strip */}
      <section className="border-y border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
            Provjereni brendovi
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <div className="relative h-16 w-[160px] sm:h-20 sm:w-[200px]">
              <Image src="/images/brands/pferd.png" alt="PFERD" fill className="object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" />
            </div>
            <div className="relative h-16 w-[160px] sm:h-20 sm:w-[200px]">
              <Image src="/images/brands/metabo.png" alt="Metabo" fill className="object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" />
            </div>
            <div className="relative h-16 w-[160px] sm:h-20 sm:w-[200px]">
              <Image src="/images/brands/festa.webp" alt="Festa" fill className="object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* B2B CTA card */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900">Poslovni kupci</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Trebate veću količinu ili posebne uvjete? Pošaljite upit i naš tim će vam
              pripremiti ponudu.
            </p>
            <a
              href="/kontakt"
              className="mt-6 inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-brand px-8 text-lg font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-dark hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Zatražite ponudu
            </a>
          </div>
        </div>
      </section>

      <div id="prednosti"><Benefits /></div>
      <div id="cta"><CTASection /></div>
    </>
  );
}
