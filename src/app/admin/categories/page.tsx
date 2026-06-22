import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kategorije</h1>
        <Button asChild><Link href="/admin/categories"><Plus className="mr-2 h-4 w-4" /> Nova kategorija</Link></Button>
      </div>
      <Card className="p-8 text-center text-slate-500">Kategorije — uskoro.</Card>
    </div>
  );
}
