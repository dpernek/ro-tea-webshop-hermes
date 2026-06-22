import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  PENDING: "Na čekanju",
  PAID: "Plaćeno",
  FAILED: "Neuspjelo",
  REFUNDED: "Refundirano",
  UNPAID: "Nije plaćeno",
};

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { orderNumber: true } } },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Plaćanja</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Narudžba
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Provider
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Metoda</th>
                <th className="px-4 py-3 font-medium text-slate-600">Iznos</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">TX ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${p.orderId}`}
                      className="text-xs text-[#0055a8] hover:underline"
                    >
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.provider}</td>
                  <td className="px-4 py-3 text-slate-500">{p.method}</td>
                  <td className="px-4 py-3">
                    {p.amount.toFixed(2)} {p.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {p.transactionId || "—"}
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
