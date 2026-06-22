import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ select: { id: true, name: true } }),
    db.brand.findMany({ select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return <ProductForm product={product as any} categories={categories} brands={brands} />;
}
