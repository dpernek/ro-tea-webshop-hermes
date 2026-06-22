import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CatalogForm } from "@/components/admin/CatalogForm";

export default async function EditCatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const catalog = await db.catalog.findUnique({ where: { id } });
  if (!catalog) notFound();
  return <CatalogForm catalog={catalog} />;
}
