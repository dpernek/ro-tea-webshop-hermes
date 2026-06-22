import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog proizvoda | RO-TEA",
  description: "Pronađite tehničku opremu, alate i materijale.",
};

export default async function CatalogPage() {
  const [products, categories, brands] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: { id: true, slug: true, name: true, sku: true, price: true, regularPrice: true, salePrice: true, image: true, featured: true, badge: true, type: true, categoryId: true, brandId: true, shortDescription: true },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.brand.findMany(),
  ]);

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Katalog proizvoda</h1>
            <p className="mt-2 text-slate-600">Pronađite tehničku opremu, alate i materijale.</p>
          </AnimatedSection>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid products={products as any} allCategories={categories as any} />
      </div>
    </div>
  );
}
