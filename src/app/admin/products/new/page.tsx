import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function AdminNewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products"><ArrowLeft className="mr-1 h-4 w-4" /> Natrag</Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Novi proizvod</h1>
      </div>
      <Card>
        <p className="p-8 text-center text-slate-500">Forma za dodavanje proizvoda — bit će dostupna uskoro.</p>
      </Card>
    </div>
  );
}
