import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { db } from "@/lib/db";

interface CategoryPageProps { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Kategorija | RO-TEA" };
  return { title: `${cat.name} | RO-TEA`, description: cat.description || "" };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) notFound();

  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" } });
  const products = await db.product.findMany({ where: { categoryId: cat.id, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });

  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <AnimatedSection>
            <nav className="mb-4 text-sm text-slate-500">
              <Link href="/" className="hover:text-[#0055a8]">Početna</Link>{" / "}
              <Link href="/proizvodi" className="hover:text-[#0055a8]">Proizvodi</Link>{" / "}
              <span className="text-slate-400">{cat.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{cat.name}</h1>
            <p className="mt-2 text-slate-600">{products.length} proizvoda</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Kategorije</h3>
              <nav className="space-y-0.5">
                {cats.map(c => (
                  <Link key={c.id} href={`/kategorije/${c.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${c.id === cat.id ? "bg-[#0055a8]/10 font-medium text-[#0055a8]" : "text-slate-600 hover:bg-slate-100"}`}>
                    {c.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <div className="min-w-0 flex-1">
            <ProductGrid products={products as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
