import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  noStore();

  // ── KPI Metrics ──────────────────────────────────────────
  const [
    activeProducts,
    totalOrders,
    unreadOrders,
    pendingOrders,
    unpaidOrders,
    glsOrdersWithoutShipment,
    productsWithoutStock,
    productsLowStock,
  ] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.order.count(),
    db.order.count({ where: { viewed: false } }),
    db.order.count({ where: { status: { in: ["PENDING"] } } }),
    db.order.count({ where: { paymentStatus: "UNPAID", status: { notIn: ["CANCELLED", "REFUNDED"] } } }),
    db.order.count({ where: { shippingMethod: { startsWith: "GLS" }, glsShipmentId: null } }),
    db.product.count({ where: { status: "ACTIVE", stock: 0 } }),
    db.product.count({ where: { status: "ACTIVE", stock: { gt: 0, lte: 3 } } }),
  ]);

  // Revenue (non-cancelled, non-refunded)
  const rev = await db.order.aggregate({
    _sum: { total: true },
    where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
  });
  const revenue = rev._sum.total || 0;

  // ── Recent orders (last 15) ─────────────────────────────
  const recentOrders = await db.order.findMany({
    select: {
      id: true, orderNumber: true, customerName: true, total: true,
      status: true, paymentStatus: true, shippingMethod: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  // ── Stock alerts ────────────────────────────────────────
  const stockAlerts = await db.product.findMany({
    select: { id: true, name: true, sku: true, stock: true, status: true },
    where: { status: "ACTIVE", stock: { not: null, lte: 3 } },
    orderBy: { stock: "asc" },
    take: 10,
  });

  // ── GLS status ──────────────────────────────────────────
  const glsOrdersTotal = await db.order.count({ where: { shippingMethod: { startsWith: "GLS" } } });
  const glsOrdersCreated = await db.order.count({ where: { shippingMethod: { startsWith: "GLS" }, glsShipmentId: { not: null } } });

  // ── Audit log (last 10) ─────────────────────────────────
  const auditEntries = await db.auditLog.findMany({
    select: { resource: true, action: true, summary: true, userEmail: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // ── KPI cards data ──────────────────────────────────────
  const kpis = [
    { title: "Nepregledane narudžbe", value: unreadOrders, subtitle: "još nisu pregledane", href: "/admin/orders?unread=1", color: "bg-red-50 text-red-700" },
    { title: "Na čekanju", value: pendingOrders, subtitle: "čekaju obradu", href: "/admin/orders?status=PENDING", color: "bg-amber-50 text-amber-700" },
    { title: "Neplaćene", value: unpaidOrders, subtitle: "čekaju uplatu / pouzeće", href: "/admin/orders?paymentStatus=UNPAID", color: "bg-orange-50 text-orange-700" },
    { title: "Prodaja (sveukupno)", value: `${revenue.toFixed(2)} €`, subtitle: "lifetime, bez otkazanih/refundiranih", color: "bg-green-50 text-green-700" },
    { title: "Aktivni proizvodi", value: activeProducts, subtitle: "u katalogu", href: "/admin/products", color: "bg-blue-50 text-blue-700" },
    { title: "Niska zaliha", value: productsWithoutStock + productsLowStock, subtitle: `${productsWithoutStock} bez zalihe • ${productsLowStock} ≤ 3 kom.`, href: "/admin/products?lowStock=1", color: "bg-red-50 text-red-700" },
  ];

  const hasAttention = unreadOrders > 0 || pendingOrders > 0 || unpaidOrders > 0 || glsOrdersWithoutShipment > 0 || stockAlerts.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Pregled stanja webshopa i operativnih zadataka.</p>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(kpi => (
          <Card key={kpi.title} className={kpi.href ? "hover:shadow-md transition-shadow" : ""}>
            <CardContent className="p-5">
              {kpi.href ? (
                <Link href={kpi.href} className="block">
                  <p className="text-sm text-slate-500">{kpi.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpi.subtitle}</p>
                </Link>
              ) : (
                <>
                  <p className="text-sm text-slate-500">{kpi.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{kpi.subtitle}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Attention / Priority Block ────────────────────── */}
      {hasAttention && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            Potrebno reagirati
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unreadOrders > 0 && (
              <Link href="/admin/orders?unread=1" className="rounded-lg border border-amber-200 bg-amber-50 p-4 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-amber-800">{unreadOrders} novih narudžbi (nepregledano)</p>
                <p className="text-xs text-amber-600 mt-0.5">Pregledaj nepročitane narudžbe →</p>
              </Link>
            )}
            {pendingOrders > 0 && (
              <Link href="/admin/orders?status=PENDING" className="rounded-lg border border-amber-200 bg-amber-50 p-4 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-amber-800">{pendingOrders} narudžbi na čekanju</p>
                <p className="text-xs text-amber-600 mt-0.5">Promijeni status u Potvrđeno →</p>
              </Link>
            )}
            {unpaidOrders > 0 && (
              <Link href="/admin/orders?paymentStatus=UNPAID" className="rounded-lg border border-red-200 bg-red-50 p-4 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-red-800">{unpaidOrders} neplaćenih narudžbi</p>
                <p className="text-xs text-red-600 mt-0.5">Provjeri uplate i potvrdi →</p>
              </Link>
            )}
            {glsOrdersWithoutShipment > 0 && (
              <Link href="/admin/orders?gls=1" className="rounded-lg border border-blue-200 bg-blue-50 p-4 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-blue-800">{glsOrdersWithoutShipment} GLS narudžbi bez pošiljke</p>
                <p className="text-xs text-blue-600 mt-0.5">Kreiraj GLS naljepnice →</p>
              </Link>
            )}
            {stockAlerts.length > 0 && (
              <Link href="/admin/products?lowStock=1" className="rounded-lg border border-red-200 bg-red-50 p-4 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-red-800">{stockAlerts.length} artikala s niskom zalihom</p>
                <p className="text-xs text-red-600 mt-0.5">Dopuni zalihe →</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Recent Orders ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Zadnje narudžbe</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Sve narudžbe →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-slate-500 text-center">Još nema narudžbi.</CardContent></Card>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Broj</th>
                    <th className="px-4 py-3">Kupac</th>
                    <th className="px-4 py-3">Iznos</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Plaćanje</th>
                    <th className="px-4 py-3">Dostava</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => {
                    const statusColors: Record<string, string> = {
                      PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-blue-100 text-blue-800",
                      PROCESSING: "bg-indigo-100 text-indigo-800", SHIPPED: "bg-purple-100 text-purple-800",
                      COMPLETED: "bg-green-100 text-green-800", CANCELLED: "bg-red-100 text-red-800",
                      REFUNDED: "bg-gray-100 text-gray-800",
                    };
                    const paymentColors: Record<string, string> = {
                      UNPAID: "bg-orange-100 text-orange-800", PAID: "bg-green-100 text-green-800",
                      REFUNDED: "bg-gray-100 text-gray-800", PARTIALLY_REFUNDED: "bg-yellow-100 text-yellow-800",
                    };
                    return (
                      <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-900">
                          <Link href={`/admin/orders/${o.id}`} className="hover:text-indigo-600">{o.orderNumber}</Link>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{o.customerName}</td>
                        <td className="px-4 py-2.5 font-medium">{formatPrice(o.total)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || "bg-slate-100 text-slate-700"}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentColors[o.paymentStatus] || "bg-slate-100 text-slate-700"}`}>{o.paymentStatus}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{o.shippingMethod}</td>
                        <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString("hr-HR")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Stock Alerts ──────────────────────────────────── */}
      {stockAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Zalihe za dopuniti <span className="text-xs font-normal text-slate-400">(≤ 3 kom.)</span></h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stockAlerts.map(p => (
              <Card key={p.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/admin/products/${p.id}/edit`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                        {p.sku && <p className="text-xs text-slate-400">{p.sku}</p>}
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${p.stock != null && p.stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {p.stock != null && p.stock <= 0 ? "0" : p.stock}
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/admin/products?lowStock=1" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Svi proizvodi niske zalihe →</Link>
          </div>
        </div>
      )}

      {/* ── GLS Status ────────────────────────────────────── */}
      {glsOrdersTotal > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">GLS dostava</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Ukupno GLS narudžbi</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{glsOrdersTotal}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Kreirane pošiljke</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{glsOrdersCreated}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">Bez pošiljke</p>
                {glsOrdersWithoutShipment > 0 && <p className="text-xs text-slate-400 mt-0.5">(uklj. stornirane)</p>}
                <p className={`text-2xl font-bold mt-1 ${glsOrdersWithoutShipment > 0 ? "text-red-700" : "text-slate-900"}`}>{glsOrdersWithoutShipment}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Quick Links ───────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Brzi linkovi</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { href: "/admin/orders", label: "Narudžbe", desc: `${totalOrders} ukupno` },
            { href: "/admin/products", label: "Proizvodi", desc: `${activeProducts} aktivnih` },
            { href: "/admin/products/new", label: "Novi proizvod", desc: "Dodaj artikl" },
            { href: "/admin/coupons", label: "Kuponi", desc: "Upravljaj popustima" },
            { href: "/admin/shipping", label: "Dostava", desc: "Načini dostave" },
            { href: "/admin/content", label: "Sadržaj", desc: "Uredi homepage" },
            { href: "/admin/katalozi", label: "Katalozi", desc: "PDF katalozi" },
            { href: "/admin/categories", label: "Kategorije", desc: "Organizacija" },
            { href: "/admin/brands", label: "Brendovi", desc: "Proizvođači" },
            { href: "/admin/settings", label: "Postavke", desc: "Konfiguracija" },
            { href: "/admin/audit-log", label: "Audit log", desc: "Zadnje aktivnosti" },
            { href: "/admin/korisnici", label: "Korisnici", desc: "Admin pristup" },
          ].map(l => (
            <Link key={l.href} href={l.href} className="rounded-lg border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-slate-900 text-sm">{l.label}</h3>
              <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Audit Activity ────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Zadnje aktivnosti</h2>
        {auditEntries.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-slate-500 text-center">Nema zabilježenih aktivnosti.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {auditEntries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm">
                <span className="text-xs text-slate-400 min-w-[60px]">
                  {(new Date(e.createdAt).toDateString() === new Date().toDateString() ? "danas " : "") + new Date(e.createdAt).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-xs text-slate-500">{e.userEmail}</span>
                <span className="font-medium text-slate-700">{e.resource}</span>
                <span className="text-xs text-slate-500">{e.action}</span>
                <span className="text-xs text-slate-400 flex-1 truncate">{e.summary}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
