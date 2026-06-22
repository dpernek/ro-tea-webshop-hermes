import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Placeholder — DB connection not yet stable
  const products: any[] = [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Proizvodi</h1>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Novi proizvod</Link>
        </Button>
      </div>

      <Card>
        <p className="p-8 text-center text-slate-500">
          Baza podataka se konfigurira. Proizvodi će biti dostupni uskoro.
        </p>
      </Card>
    </div>
  );
}
