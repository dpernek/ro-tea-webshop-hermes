import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { ShoppingCart, ShoppingBag, Users, TrendingUp, Circle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  let productCount = 0, orderCount = 0, customerCount = 0, revenue = 0, unreadOrders = 0;

  try {
    [productCount, orderCount, customerCount, unreadOrders] = await Promise.all([
      db.product.count({ where: { status: "ACTIVE" } }),
      db.order.count(),
      db.customer.count(),
      db.order.count({ where: { viewed: false } }),
    ]);
    const rev = await db.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } });
    revenue = rev._sum.total || 0;
  } catch {}

  const stats = [
    { title: "Ukupna prodaja", value: `${revenue.toFixed(2)} €`, icon: TrendingUp, color: "text-green-600 bg-green-100" },
    { title: "Narudžbe", value: orderCount, icon: ShoppingCart, color: "text-blue-600 bg-blue-100", badge: unreadOrders },
    { title: "Proizvodi", value: productCount, icon: ShoppingBag, color: "text-orange-600 bg-orange-100" },
    { title: "Kupci", value: customerCount, icon: Users, color: "text-purple-600 bg-purple-100" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${s.color}`}><Icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500">{s.title}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {s.value}
                    {s.badge && s.badge > 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        <Circle className="mr-1 h-1.5 w-1.5 fill-red-500" />
                        +{s.badge} nova
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Brzi linkovi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/admin/products", label: "Proizvodi", desc: `${productCount} proizvoda u katalogu` },
            { href: "/admin/orders", label: "Narudžbe", desc: unreadOrders > 0 ? `${orderCount} narudžbi · ${unreadOrders} novih` : `${orderCount} narudžbi` },
            { href: "/admin/categories", label: "Kategorije", desc: "Upravljaj kategorijama" },
            { href: "/admin/brands", label: "Brendovi", desc: "Upravljaj brendovima" },
            { href: "/admin/katalozi", label: "Katalozi", desc: "Upravljaj katalozima" },
            { href: "/admin/settings", label: "Postavke", desc: "Postavke webshopa" },
          ].map(l => (
            <Link key={l.href} href={l.href} className="rounded-xl border border-slate-200 p-5 hover:border-[#0055a8] hover:shadow-sm transition-all">
              <h3 className="font-semibold text-slate-900">{l.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
