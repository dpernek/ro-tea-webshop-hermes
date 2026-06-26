import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().min(1, "Ime je obavezno."),
  customerEmail: z.string().email("Nevažeća e-mail adresa."),
  customerPhone: z.string().min(1, "Telefon je obavezan."),
  address: z.string().min(1, "Adresa je obavezna."),
  city: z.string().min(1, "Grad je obavezan."),
  postalCode: z.string().min(1, "Poštanski broj je obavezan."),
  paymentMethod: z.string().min(1),
  shippingMethodId: z.string().min(1, "Odaberite način dostave."),
  note: z.string().optional(),
  subtotal: z.number(), shippingTotal: z.number(), total: z.number(),
  items: z.array(z.object({ productId: z.string(), productName: z.string(), sku: z.string().optional(), quantity: z.number().min(1), unitPrice: z.number() })),
});

export async function POST(req: NextRequest) {
  const access = await requirePermission("orders", "write");
  if (access) return access;

  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { items, ...data } = parsed.data;

  // Generate order number
  const count = await db.order.count();
  const orderNumber = `ROTEA-${String(count + 1).padStart(5, "0")}`;

  // Get or create customer
  let customer = await db.customer.findFirst({ where: { OR: [{ email: data.customerEmail }, { phone: data.customerPhone }] } });
  if (!customer) {
    customer = await db.customer.create({
      data: { name: data.customerName, email: data.customerEmail, phone: data.customerPhone, shippingAddress: `${data.address}, ${data.postalCode} ${data.city}` },
    });
  }

  // Get shipping method name
  const shipMethod = await db.shippingMethod.findUnique({ where: { id: data.shippingMethodId }, select: { name: true } });

  const order = await db.order.create({
    data: {
      orderNumber, customerId: customer.id,
      customerEmail: data.customerEmail, customerName: data.customerName, customerPhone: data.customerPhone,
      shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      subtotal: data.subtotal, shippingTotal: data.shippingTotal, taxTotal: 0, total: data.total,
      discountTotal: 0, currency: "EUR", status: "PENDING", paymentStatus: "UNPAID",
      paymentMethod: data.paymentMethod, shippingMethod: shipMethod?.name || data.shippingMethodId,
      note: data.note || null,
      items: { create: items.map(i => ({ productId: i.productId, productName: i.productName, sku: i.sku || null, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })) },
    },
    select: { id: true, orderNumber: true },
  });

  await logAction("orders", "create", `Ručno kreirana narudžba ${order.orderNumber}`, order.id);
  return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
}
