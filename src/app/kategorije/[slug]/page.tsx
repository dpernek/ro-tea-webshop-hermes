import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
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
  if (!category) notFound();

  const categoryProducts = products.filter((p) => p.categorySlug === slug);

  // Only show categories that have products
  const activeCategories = categories.filter((c) => c.count > 0);

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <AnimatedSection>
            <nav className="mb-3 text-sm text-slate-500">
              <Link href="/" className="hover:text-brand">
                Početna
              </Link>
              <span className="mx-2">/</span>
              <Link href="/proizvodi" className="hover:text-brand">
                Proizvodi
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900">{category.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900">
              {category.name}
            </h1>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid
          products={categoryProducts}
          allCategories={activeCategories}
          currentCategory={category}
        />
      </div>
    </div>
  );
}
