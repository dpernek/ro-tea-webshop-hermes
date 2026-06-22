import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus, addAdminNote } from "@/lib/actions/orders";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payments: true,
      customer: true,
    },
  });

  if (!order) notFound();

  const availableStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ];
  const availablePaymentStatuses = [
    "UNPAID",
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Natrag
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          Narudžba {order.orderNumber}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Stavke narudžbe</h2>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 font-medium text-slate-600">
                    Proizvod
                  </th>
                  <th className="px-4 py-2 font-medium text-slate-600">SKU</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">
                    Količina
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">
                    Cijena
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">
                    Ukupno
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.sku || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {item.unitPrice.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.total.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Totals */}
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Ukupno proizvoda</span>
                <span>{order.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Dostava</span>
                <span>{order.shippingTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Porez</span>
                <span>{order.taxTotal.toFixed(2)} €</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Popust</span>
                  <span>-{order.discountTotal.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
                <span>Ukupno</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </div>
          </Card>

          {/* Admin Note */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Interna napomena</h3>
            {order.adminNote && (
              <p className="mt-2 text-sm text-slate-600">{order.adminNote}</p>
            )}
            <form
              action={async (formData: FormData) => {
                "use server";
                await addAdminNote(
                  order.id,
                  String(formData.get("note") || "")
                );
              }}
              className="mt-3"
            >
              <textarea
                name="note"
                defaultValue={order.adminNote || ""}
                rows={3}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                placeholder="Dodajte internu napomenu..."
              />
              <Button type="submit" size="sm" className="mt-2">
                Spremi napomenu
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Kupac</h3>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium text-slate-900">{order.customerName}</p>
              {order.customerEmail && (
                <p className="text-slate-500">{order.customerEmail}</p>
              )}
              {order.customerPhone && (
                <p className="text-slate-500">{order.customerPhone}</p>
              )}
              {order.shippingAddress && (
                <p className="mt-2 text-slate-600">{order.shippingAddress}</p>
              )}
            </div>
          </Card>

          {/* Order status */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Status narudžbe</h3>
            <div className="mt-3 space-y-3">
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateOrderStatus(
                    order.id,
                    String(formData.get("status") || "")
                  );
                }}
              >
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                >
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {orderStatusLabels[s]}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="mt-2 w-full">
                  Ažuriraj status
                </Button>
              </form>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  const { updatePaymentStatus } =
                    await import("@/lib/actions/orders");
                  await updatePaymentStatus(
                    order.id,
                    String(formData.get("paymentStatus") || "")
                  );
                }}
              >
                <label className="text-xs font-medium text-slate-500">
                  Status plaćanja
                </label>
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                >
                  {availablePaymentStatuses.map((s) => (
                    <option key={s} value={s}>
                      {paymentStatusLabels[s]}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="mt-2 w-full">
                  Ažuriraj plaćanje
                </Button>
              </form>
            </div>
          </Card>

          {/* Order info */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Detalji</h3>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>Metoda plaćanja: {order.paymentMethod}</p>
              {order.shippingMethod && <p>Dostava: {order.shippingMethod}</p>}
              <p>Valuta: {order.currency}</p>
              <p className="mt-2 text-xs text-slate-400">
                Kreirano: {new Date(order.createdAt).toLocaleString("hr-HR")}
              </p>
            </div>
          </Card>

          {/* Payments */}
          {order.payments.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900">Plaćanja</h3>
              <div className="mt-3 space-y-2">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-lg bg-slate-50 p-3 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {payment.provider}
                    </p>
                    <p className="text-slate-500">
                      {payment.method} · {payment.amount.toFixed(2)}{" "}
                      {payment.currency}
                    </p>
                    <p className="text-xs text-slate-400">
                      {paymentStatusLabels[payment.status] || payment.status}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-slate-400">
                        TX: {payment.transactionId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
