import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface CategoryPageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Kategorija | RO-TEA" };
  return {
    title: (cat as any).seoTitle || `${cat.name} | RO-TEA`,
    description: (cat as any).seoDescription || cat.description || "",
    alternates: {
      canonical: `/kategorije/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat || cat.status !== "ACTIVE") notFound();

  // Fetch all categories, ordered by sortOrder
  const allCatsRaw = await db.category.findMany({ orderBy: { sortOrder: "asc" } });

  // Count only ACTIVE products per category for accurate sidebar counts
  const activeProducts = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { categoryId: true },
  });

  const countMap: Record<string, number> = {};
  activeProducts.forEach((p) => {
    if (p.categoryId) {
      countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
    }
  });

  // Map categories with counts, normalize nullable fields, filter out empty categories
  // Always keep the current category in the sidebar even if it has 0 products
  const currentCatId = cat.id;
  const allCats = allCatsRaw
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image || "",
      count: countMap[c.id] || 0,
    }))
    .filter((c) => c.count > 0 || c.id === currentCatId);

  // Fetch products for this category (ACTIVE only, newest first)
  const products = await db.product.findMany({
    where: { categoryId: cat.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <nav className="mb-4 text-sm text-slate-500">
              <Link href="/" className="hover:text-[#0055a8]">Početna</Link>
              {" / "}
              <Link href="/proizvodi" className="hover:text-[#0055a8]">Trgovina</Link>
              {" / "}
              <span className="text-slate-400">{cat.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{cat.name}</h1>
            {((cat as any).introText || cat.description) && (
              <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{(cat as any).introText || cat.description}</p>
            )}
            <p className="mt-2 text-sm font-medium text-slate-500">
              {products.length} proizvoda
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid
          products={products as any}
          categories={allCats as any}
          currentCategory={{ id: cat.id, slug: cat.slug, name: cat.name, description: cat.description, image: cat.image || "", count: countMap[cat.id] || 0 } as any}
        />
      </div>
    </div>
  );
}
