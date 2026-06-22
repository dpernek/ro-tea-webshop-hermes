import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { VariableProductOptions } from "@/components/product/VariableProductOptions";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Proizvod nije pronađen | RO-TEA" };
  return { title: `${product.name} | RO-TEA`, description: product.shortDescription || product.name };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product || product.status !== "ACTIVE") notFound();

  const category = product.categoryId ? await db.category.findUnique({ where: { id: product.categoryId } }) : null;

  const displayImages = [product.image, ...JSON.parse(product.gallery || "[]")].filter(Boolean);

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0055a8]">Početna</Link>
          {" / "}
          <Link href="/proizvodi" className="hover:text-[#0055a8]">Proizvodi</Link>
          {category && (
            <>
              {" / "}
              <Link href={`/kategorije/${category.slug}`} className="hover:text-[#0055a8]">{category.name}</Link>
            </>
          )}
          {" / "}
          <span className="text-slate-400">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedSection>
            <ProductGallery images={displayImages} alt={product.name} />
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {product.featured && <Badge variant="accent">Istaknuto</Badge>}
              {product.badge && <Badge variant="accent">{product.badge}</Badge>}
              <Badge variant="outline">{product.stockStatus === "INSTOCK" ? "Dostupno" : product.stockStatus}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{product.name}</h1>

            {product.sku && <p className="mt-2 text-sm text-slate-500">SKU: {product.sku}</p>}

            <div className="mt-6">
              {product.type === "VARIABLE" && product.priceRangeMin ? (
                <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {formatPrice(product.priceRangeMin)} – {formatPrice(product.priceRangeMax || product.priceRangeMin)}
                </div>
              ) : (
                <PriceDisplay
                  price={product.price}
                  oldPrice={product.regularPrice && product.regularPrice > product.price ? product.regularPrice : undefined}
                  size="lg"
                />
              )}
            </div>

            <div className="mt-8">
              {product.type === "VARIABLE" ? (
                <VariableProductOptions product={product as any} />
              ) : (
                <AddToCartButton product={product as any} />
              )}
            </div>
          </AnimatedSection>
        </div>

        {product.description && (
          <AnimatedSection delay={0.2}>
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900">Opis</h2>
              <div className="prose prose-slate mt-4 max-w-none whitespace-pre-line">{product.description}</div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
