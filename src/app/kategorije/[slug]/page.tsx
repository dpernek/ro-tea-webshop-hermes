import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product-mapper";

export const dynamic = "force-dynamic";

interface CategoryPageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug }, select: { name: true, description: true, seoTitle: true, seoDescription: true } });
  if (!cat) return { title: "Kategorija | RO-TEA" };
  return {
    title: cat.seoTitle || `${cat.name} | RO-TEA`,
    description: cat.seoDescription || cat.description || "",
    alternates: { canonical: `/kategorije/${slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug }, select: { id: true, slug: true, name: true, description: true, image: true, parentId: true, status: true, introText: true } });
  if (!cat || cat.status !== "ACTIVE") notFound();

  const allCatsRaw = await db.category.findMany({
    select: { id: true, slug: true, name: true, description: true, image: true, parentId: true, sortOrder: true, status: true },
    orderBy: { sortOrder: "asc" },
  });

  const activeProducts = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { categoryId: true },
  });

  const countMap: Record<string, number> = {};
  activeProducts.forEach((p) => { if (p.categoryId) countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1; });

  const currentCatId = cat.id;
  const allCats = allCatsRaw
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, image: c.image || "", count: countMap[c.id] || 0 }))
    .filter((c) => c.count > 0 || c.id === currentCatId);
  // Fetch products for this category (ACTIVE only, newest first)
  const products = await db.product.findMany({
    where: { categoryId: cat.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, name: true, price: true, salePrice: true, regularPrice: true, image: true, badge: true, featured: true, type: true, shortDescription: true, stock: true, stockStatus: true, category: { select: { slug: true, name: true } }, brand: { select: { slug: true, name: true } } },
  });
  const mappedProducts = products.map(mapProduct);

  return (
    <div className="bg-white">
      {/* Header — category identity + intro */}
      <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <AnimatedSection>
            <nav className="mb-3 text-sm text-slate-400">
              <Link href="/" className="hover:text-[#0055a8] transition-colors">Početna</Link>
              <span className="mx-1.5">/</span>
              <Link href="/proizvodi" className="hover:text-[#0055a8] transition-colors">Trgovina</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-500">{cat.name}</span>
            </nav>
            
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              {/* Category image — visual anchor */}
              {cat.image && (
                <div className="hidden h-32 w-48 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-contain p-2" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{cat.name}</h1>
                  <span className="rounded-full bg-[#0055a8]/10 px-3 py-0.5 text-sm font-semibold text-[#0055a8]">
                    {products.length} proizvoda
                  </span>
                </div>
                
                {cat.description && (
                  <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{cat.description}</p>
                )}
                
                {cat.introText && (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
                    {cat.introText}
                  </p>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={mappedProducts as any} categories={allCats as any} currentCategory={{ id: cat.id, slug: cat.slug, name: cat.name, description: cat.description, image: cat.image || "", count: countMap[cat.id] || 0 } as any} />
      </div>
    </div>
  );
}
