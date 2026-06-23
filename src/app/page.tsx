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
      <Benefits />
      <CTASection />
    </>
  );
}
