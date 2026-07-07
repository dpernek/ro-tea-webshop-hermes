import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";

export const dynamic = "force-dynamic";

interface BrandPageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await db.brand.findUnique({
    where: { slug },
    select: { name: true, description: true, seoTitle: true, seoDescription: true },
  });
  if (!brand) return { title: "Brend | RO-TEA" };
  return {
    title: brand.seoTitle || `${brand.name} | RO-TEA`,
    description: brand.seoDescription || brand.description || "",
    alternates: { canonical: `/brendovi/${slug}` },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await db.brand.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true, image: true, introText: true },
  });
  if (!brand) notFound();

  const products = await db.product.findMany({
    where: { brandId: brand.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, slug: true, name: true, price: true, salePrice: true, regularPrice: true,
      image: true, badge: true, featured: true, type: true, shortDescription: true,
      stock: true, stockStatus: true, priceRangeMin: true, priceRangeMax: true,
      category: { select: { slug: true, name: true } },
      brand: { select: { slug: true, name: true } },
    },
  });
  const mappedProducts = products.map(mapProduct);

  const allCatsRaw = await db.category.findMany({
    select: { id: true, slug: true, name: true, description: true, image: true, sortOrder: true, status: true },
    orderBy: { sortOrder: "asc" },
  });
  const activeProducts = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { categoryId: true },
  });
  const countMap: Record<string, number> = {};
  activeProducts.forEach((p) => { if (p.categoryId) countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1; });
  const allCats = allCatsRaw
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, image: c.image || "", count: countMap[c.id] || 0 }));

  const count = products.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <nav className="mb-4 text-sm text-slate-500">
              <Link href="/" className="hover:text-[#0055a8]">Početna</Link>
              {" / "}
              <Link href="/proizvodi" className="hover:text-[#0055a8]">Trgovina</Link>
              {" / "}
              <span className="text-slate-400">{brand.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{brand.name}</h1>
            {brand.description && (
              <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{brand.description}</p>
            )}
            {brand.introText && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-white/80 p-5">
                <p className="text-sm leading-relaxed text-slate-600">{brand.introText}</p>
              </div>
            )}
            <p className="mt-3 text-sm font-medium text-slate-500">
              {count} proizvoda
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {count === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500">Trenutno nema proizvoda za ovaj brend.</p>
            <Link href="/proizvodi" className="mt-3 inline-block text-sm font-medium text-[#0055a8] hover:underline">
              Pregledaj sve proizvode →
            </Link>
          </div>
        ) : (
          <ProductGrid products={mappedProducts as any} categories={allCats as any} />
        )}
      </div>
    </div>
  );
}
