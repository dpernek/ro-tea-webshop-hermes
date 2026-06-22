import { Hero } from "@/components/home/Hero";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { PopularProducts } from "@/components/home/PopularProducts";
import { Benefits } from "@/components/home/Benefits";
import { CTASection } from "@/components/home/CTASection";
import { products } from "@/lib/data";

export default function HomePage() {
  // Pick 4 highest-priced featured products for hero images
  const heroImages = products
    .filter((p) => p.featured && p.image && !p.image.includes("placeholder"))
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 4)
    .map((p) => p.image);

  return (
    <>
      <Hero heroImages={heroImages} />
      <FeaturedCategories />
      <PopularProducts />
      <Benefits />
      <CTASection />
    </>
  );
}
