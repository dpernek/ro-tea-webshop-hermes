import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { checkRateLimitAdmin } from "@/lib/rate-limit-admin";
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
  items: z.array(z.object({ productId: z.string(), quantity: z.number().min(1) })),
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

  const data = parsed.data;

  // Validate products exist and get real prices
  const productIds = data.items.map(i => i.productId);
  const existingProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, salePrice: true, regularPrice: true, sku: true, status: true },
  });

  const productMap = new Map(existingProducts.map(p => [p.id, p]));
  const badIds = productIds.filter(id => !productMap.has(id));
  if (badIds.length > 0) {
    return NextResponse.json({ error: `Proizvodi ne postoje: ${badIds.join(", ")}` }, { status: 400 });
  }

  // Calculate line items with server prices
  const lineItems = data.items.map(item => {
    const p = productMap.get(item.productId)!;
    const unitPrice = p.salePrice || p.price || p.regularPrice || 0;
    return {
      productId: p.id, productName: p.name, sku: p.sku || null,
      quantity: item.quantity, unitPrice, total: item.quantity * unitPrice,
    };
  });

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);

  // Get shipping from DB (server-side pricing)
  const shipMethod = await db.shippingMethod.findUnique({
    where: { id: data.shippingMethodId },
    select: { name: true, price: true, freeAboveAmount: true },
  });
  if (!shipMethod) return NextResponse.json({ error: "Odabrani način dostave ne postoji." }, { status: 400 });

  const isFreeShip = shipMethod.freeAboveAmount != null && subtotal >= shipMethod.freeAboveAmount;
  const shippingTotal = isFreeShip ? 0 : shipMethod.price;
  const total = subtotal + shippingTotal;

  // Generate order number
  const count = await db.order.count();
  const orderNumber = `ROTEA-${String(count + 1).padStart(5, "0")}`;

  // Get or create customer
  let customer = await db.customer.findFirst({
    where: { OR: [{ email: data.customerEmail }, { phone: data.customerPhone }] },
  });
  if (!customer) {
    customer = await db.customer.create({
      data: { name: data.customerName, email: data.customerEmail, phone: data.customerPhone,
        shippingAddress: `${data.address}, ${data.postalCode} ${data.city}` },
    });
  }

  const order = await db.order.create({
    data: {
      orderNumber, customerId: customer.id,
      customerEmail: data.customerEmail, customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      subtotal, shippingTotal, taxTotal: 0, total, discountTotal: 0,
      currency: "EUR", status: "PENDING", paymentStatus: "UNPAID",
      paymentMethod: data.paymentMethod,
      shippingMethod: shipMethod.name,
      note: data.note || null,
      items: { create: lineItems.map(i => ({ productId: i.productId, productName: i.productName, sku: i.sku, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })) },
    },
    select: { id: true, orderNumber: true },
  });

  await logAction("orders", "create", `Ručno kreirana narudžba ${order.orderNumber}`, order.id);
  return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
}
