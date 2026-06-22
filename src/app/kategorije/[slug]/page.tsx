import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Kategorija nije pronađena" };

  return {
    title: `${category.name} | RO-TEA`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((p) => p.categorySlug === slug);

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle title={category.name} subtitle={category.description} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          {categoryProducts.length > 0 ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <EmptyState
              title="Ova kategorija trenutno nema proizvoda"
              description="Pogledajte ostale kategorije u našem katalogu."
              action={
                <Button asChild variant="outline">
                  <Link href="/proizvodi">Svi proizvodi</Link>
                </Button>
              }
            />
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
