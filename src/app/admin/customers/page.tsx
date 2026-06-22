import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Kupci</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Ime</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Telefon
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Narudžbe
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {c._count.orders}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("hr-HR")}
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
