import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingCart, ShoppingBag, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [orderCount, productCount, customerCount, recentOrders, totalRevenue] =
    await Promise.all([
      db.order.count(),
      db.product.count({ where: { status: "ACTIVE" } }),
      db.customer.count(),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      }),
    ]);

  const revenue = totalRevenue._sum.total || 0;

  const stats = [
    {
      title: "Ukupna prodaja",
      value: `${revenue.toFixed(2)} €`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Narudžbe",
      value: orderCount,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Proizvodi",
      value: productCount,
      icon: ShoppingBag,
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Kupci",
      value: customerCount,
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  const orderStatusLabels: Record<string, string> = {
    PENDING: "Na čekanju",
    CONFIRMED: "Potvrđeno",
    PROCESSING: "U obradi",
    SHIPPED: "Poslano",
    COMPLETED: "Završeno",
    CANCELLED: "Otkazano",
    REFUNDED: "Refundirano",
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Najnovije narudžbe
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#0055a8] hover:underline"
          >
            Sve narudžbe →
          </Link>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600">Broj</th>
                  <th className="px-6 py-3 font-medium text-slate-600">
                    Kupac
                  </th>
                  <th className="px-6 py-3 font-medium text-slate-600">
                    Ukupno
                  </th>
                  <th className="px-6 py-3 font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium text-slate-600">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#0055a8] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {orderStatusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("hr-HR")}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Nema narudžbi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
