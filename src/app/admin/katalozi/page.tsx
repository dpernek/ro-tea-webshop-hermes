import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function deleteCatalog(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await db.catalog.delete({ where: { id } });
  revalidatePath("/admin/katalozi");
}

export default async function AdminCatalogsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const catalogs = await db.catalog.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Katalozi</h1>
        <Button asChild>
          <Link href="/admin/katalozi/novi">
            <Plus className="mr-2 h-4 w-4" /> Novi katalog
          </Link>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">Brend</th>
                <th className="px-4 py-3 font-medium text-slate-600">Opis</th>
                <th className="px-4 py-3 font-medium text-slate-600">URL</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalogs.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{cat.brand}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">
                    {cat.description}
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-xs text-slate-400">
                    {cat.fileUrl}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cat.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {cat.active ? "Aktivno" : "Neaktivno"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/katalozi/${cat.id}/uredi`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={deleteCatalog.bind(null, cat.id)}>
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {catalogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Nema kataloga
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
