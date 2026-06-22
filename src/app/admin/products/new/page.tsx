import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  const brands = await db.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <ProductForm
      product={null}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
    />
  );
}
