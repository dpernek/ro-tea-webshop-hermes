import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function PopularProducts() {
  const rows = await db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { brand: true, category: true },
  });

  const products = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku ?? null,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? "",
    categorySlug: p.category?.slug ?? "",
    price: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price,
    regularPrice: p.regularPrice ?? null,
    salePrice: p.salePrice ?? null,
    oldPrice: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    image: p.image,
    gallery: [] as string[],
    shortDescription: p.shortDescription ?? "",
    description: "",
    featured: p.featured ?? false,
    badge: p.badge ?? null,
    type: (p.type?.toLowerCase() ?? "simple") as any,
    stock: p.stock ?? null,
    stockStatus: "unknown" as any,
  }));

  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle title="Popularni proizvodi" subtitle="Najtraženiji artikli iz naše ponude." />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <ProductGrid products={products} />
        </AnimatedSection>
        <AnimatedSection delay={0.2} className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/proizvodi">Pogledaj sve proizvode</Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
