import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [categories, brands] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true } }),
    db.brand.findMany({ select: { id: true, name: true } }),
  ]);

  return <ProductForm categories={categories} brands={brands} />;
}
