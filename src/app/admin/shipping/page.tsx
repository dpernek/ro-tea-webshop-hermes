import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function AdminShippingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const methods = await db.shippingMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dostava</h1>
        <Button asChild>
          <Link href="/admin/shipping/new">
            <Pencil className="mr-2 h-4 w-4" /> Nova metoda
          </Link>
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">Cijena</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Besplatno iznad
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {m.name}
                  </td>
                  <td className="px-4 py-3">{m.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    {m.freeAboveAmount
                      ? `${m.freeAboveAmount.toFixed(2)} €`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.active ? "Aktivno" : "Neaktivno"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/shipping/${m.id}/edit`}>
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
