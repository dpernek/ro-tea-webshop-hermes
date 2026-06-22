import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShoppingCart, ShoppingBag, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  // Stats - placeholder until DB connection works
  const stats = [
    { title: "Ukupna prodaja", value: "0,00 €", icon: TrendingUp, color: "text-green-600 bg-green-100" },
    { title: "Narudžbe", value: 0, icon: ShoppingCart, color: "text-blue-600 bg-blue-100" },
    { title: "Proizvodi", value: 848, icon: ShoppingBag, color: "text-orange-600 bg-orange-100" },
    { title: "Kupci", value: 0, icon: Users, color: "text-purple-600 bg-purple-100" },
  ];

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
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Brzi linkovi</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/admin/products/new", label: "Novi proizvod", desc: "Dodaj proizvod u katalog" },
            { href: "/admin/orders", label: "Narudžbe", desc: "Pregledaj sve narudžbe" },
            { href: "/admin/products", label: "Proizvodi", desc: "Upravljaj proizvodima" },
            { href: "/admin/categories", label: "Kategorije", desc: "Uredi kategorije" },
            { href: "/admin/settings", label: "Postavke", desc: "Postavke webshopa" },
            { href: "/admin/katalozi", label: "Katalozi", desc: "Upravljaj katalozima" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl border border-slate-200 p-5 hover:border-[#0055a8] hover:shadow-sm transition-all">
              <h3 className="font-semibold text-slate-900">{link.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
