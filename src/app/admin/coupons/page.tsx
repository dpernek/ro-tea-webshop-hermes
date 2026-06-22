import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";

export default async function AdminCouponsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kuponi</h1>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" /> Novi kupon
          </Link>
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Kod</th>
                <th className="px-4 py-3 font-medium text-slate-600">Tip</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Vrijednost
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Min. narudžba
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Korištenja
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.code}
                  </td>
                  <td className="px-4 py-3">
                    {c.type === "PERCENTAGE" ? "Postotak" : "Fiksni"}
                  </td>
                  <td className="px-4 py-3">
                    {c.type === "PERCENTAGE"
                      ? `${c.value}%`
                      : `${c.value.toFixed(2)} €`}
                  </td>
                  <td className="px-4 py-3">
                    {c.minimumOrderAmount
                      ? `${c.minimumOrderAmount.toFixed(2)} €`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.usedCount}/{c.usageLimit || "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.active ? "Aktivno" : "Neaktivno"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/coupons/${c.id}/edit`}>
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
