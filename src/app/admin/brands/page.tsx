import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil } from "lucide-react";

export default async function AdminBrandsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Brendovi</h1>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> Novi brend
          </Link>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Proizvodi
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {brand.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{brand.slug}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {brand._count.products}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/brands/${brand.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
