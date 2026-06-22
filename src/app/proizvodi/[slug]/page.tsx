import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { VariableProductOptions } from "@/components/product/VariableProductOptions";
import { products } from "@/lib/data";
import { categories } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
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

function StockLabel({ status }: { status: Product["stockStatus"] }) {
  if (status === "instock") {
    return <span className="text-sm font-medium text-green-600">Dostupno</span>;
  }
  if (status === "outofstock") {
    return (
      <span className="text-sm font-medium text-red-600">Nije dostupno</span>
    );
  }
  if (status === "onbackorder") {
    return (
      <span className="text-sm font-medium text-amber-600">Na narudžbu</span>
    );
  }
  return (
    <span className="text-sm font-medium text-slate-600">
      Provjeriti dostupnost
    </span>
  );
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
              {product.brand && (
                <Badge variant="outline">{product.brand}</Badge>
              )}
              {product.badge && <Badge variant="accent">{product.badge}</Badge>}
              <StockLabel status={product.stockStatus} />
            </div>

            <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>

            {product.sku && (
              <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>
            )}

            <div className="mt-6">
              {product.type === "variable" && product.priceRange ? (
                <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {product.priceRange.min === product.priceRange.max ? (
                    <PriceDisplay price={product.priceRange.min} size="lg" />
                  ) : (
                    <span>
                      {formatPrice(product.priceRange.min)} –{" "}
                      {formatPrice(product.priceRange.max)}
                    </span>
                  )}
                </div>
              ) : (
                <PriceDisplay
                  price={product.price}
                  oldPrice={product.oldPrice}
                  size="lg"
                />
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-8">
              {product.type === "variable" ? (
                <VariableProductOptions product={product} />
              ) : (
                <AddToCartButton product={product} />
              )}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Opis</h2>
              <div className="mt-4 whitespace-pre-line text-slate-600">
                {product.description}
              </div>
            </div>

            {Object.keys(product.specifications || {}).length > 0 && (
              <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Specifikacije
                </h2>
                <dl className="mt-4 divide-y divide-slate-200">
                  {Object.entries(product.specifications || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-3 text-sm"
                      >
                        <dt className="text-slate-500">{key}</dt>
                        <dd className="font-medium text-slate-900">{value}</dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>

      <RelatedProducts products={related} title="Slični proizvodi" />
    </div>
  );
}
