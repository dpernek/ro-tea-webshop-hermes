import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CatalogForm } from "@/components/admin/CatalogForm";

export default async function NewCatalogPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return <CatalogForm catalog={null} />;
}
