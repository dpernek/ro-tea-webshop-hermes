import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Proizvod nije pronađen" };

  return {
    title: `${product.name} | RO-TEA`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product: Product | undefined = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const category = categories.find((c) => c.slug === product.categorySlug);
  const related = products
    .filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id
    )
    .slice(0, 4);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand">
                Početna
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/proizvodi" className="hover:text-brand">
                Proizvodi
              </Link>
            </li>
            <li>/</li>
            {category && (
              <>
                <li>
                  <Link
                    href={`/kategorije/${category.slug}`}
                    className="hover:text-brand"
                  >
                    {category.name}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-slate-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimatedSection>
            <ProductGallery images={product.gallery} alt={product.name} />
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{product.category}</Badge>
              {product.badge && <Badge variant="accent">{product.badge}</Badge>}
              {product.stock > 0 ? (
                <span className="text-sm font-medium text-green-600">
                  Dostupno ({product.stock} kom)
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">
                  Rasprodano
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6">
              <PriceDisplay
                price={product.price}
                oldPrice={product.oldPrice}
                size="lg"
              />
            </div>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {product.description}
            </p>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Specifikacije
              </h2>
              <dl className="mt-4 divide-y divide-slate-200">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 text-sm">
                    <dt className="text-slate-500">{key}</dt>
                    <dd className="font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <RelatedProducts products={related} title="Slični proizvodi" />
    </div>
  );
}
