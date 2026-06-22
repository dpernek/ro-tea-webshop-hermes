import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PopularProducts } from "@/components/home/PopularProducts";
import { Benefits } from "@/components/home/Benefits";
import { CTASection } from "@/components/home/CTASection";

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
