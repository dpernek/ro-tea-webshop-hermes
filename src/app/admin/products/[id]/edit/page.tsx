import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ select: { id: true, name: true } }),
    db.brand.findMany({ select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  // Serialize product data to plain object (Prisma returns Decimal, Date, etc.)
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "",
    price: Number(product.price),
    regularPrice: product.regularPrice ? Number(product.regularPrice) : null,
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    stock: product.stock ?? 0,
    stockStatus: product.stockStatus ?? "UNKNOWN",
    status: product.status ?? "ACTIVE",
    featured: product.featured ?? false,
    badge: product.badge ?? "",
    type: product.type ?? "SIMPLE",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    benefits: product.benefits ?? "",
    usage: product.usage ?? "",
    warranty: product.warranty ?? "",
    deliveryNote: product.deliveryNote ?? "",
    image: product.image ?? "",
    brandId: product.brandId ?? "",
    categoryId: product.categoryId ?? "",
  };

  return (
    <ProductForm product={productData} categories={categories} brands={brands} />
  );
}
