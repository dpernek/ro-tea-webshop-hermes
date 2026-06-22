import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PopularProducts } from "@/components/home/PopularProducts";
import { Benefits } from "@/components/home/Benefits";
import { CTASection } from "@/components/home/CTASection";
import { site } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <Hero backgroundImage={site.heroImage || undefined} />
      <FeaturedCategories />
      <PopularProducts />
      <Benefits />
      <CTASection />
    </>
  );
}
