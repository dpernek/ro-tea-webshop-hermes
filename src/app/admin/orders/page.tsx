import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

const orderStatusLabels: Record<string, string> = {
  PENDING: "Na čekanju",
  CONFIRMED: "Potvrđeno",
  PROCESSING: "U obradi",
  SHIPPED: "Poslano",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  REFUNDED: "Refundirano",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Nije plaćeno",
  PENDING: "Na čekanju",
  PAID: "Plaćeno",
  FAILED: "Neuspjelo",
  REFUNDED: "Refundirano",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const status = sp.status || "";
  const paymentStatus = sp.paymentStatus || "";
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerEmail: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  function filterUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(sp as Record<string, string>);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    return `/admin/orders?${params.toString()}`;
  }

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      REFUNDED: "bg-slate-100 text-slate-600",
    };
    return colors[s] || "bg-slate-100 text-slate-600";
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Narudžbe ({total})
      </h1>

      <Card className="mb-6 p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            placeholder="Pretraži po broju, imenu, emailu..."
            defaultValue={search}
            className="min-w-[250px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Svi statusi</option>
            {Object.entries(orderStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Sva plaćanja</option>
            {Object.entries(paymentStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Filtriraj
          </button>
          <Link
            href="/admin/orders"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Očisti
          </Link>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Broj</th>
                <th className="px-4 py-3 font-medium text-slate-600">Kupac</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ukupno</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Plaćanje
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Metoda</th>
                <th className="px-4 py-3 font-medium text-slate-600">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[#0055a8] hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {order.total.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {orderStatusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.paymentStatus)}`}
                    >
                      {paymentStatusLabels[order.paymentStatus] ||
                        order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("hr-HR")}
                    <br />
                    {new Date(order.createdAt).toLocaleTimeString("hr-HR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Nema pronađenih narudžbi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <span className="text-sm text-slate-500">
              Stranica {page} od {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={filterUrl({ page: String(page - 1) })}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Prethodna
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={filterUrl({ page: String(page + 1) })}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Sljedeća
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
