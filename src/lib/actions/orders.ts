"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { computePrices } from "@/lib/pricing";
import { sendEmail, customerEmail, adminNewOrderEmail } from "@/lib/email";

export async function createOrder(data: {
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; city: string; postalCode: string; note?: string;
  items: Array<{ productId: string; productName: string; sku?: string; quantity: number; unitPrice: number }>;
  paymentMethod: string; shippingMethodId: string;
  shippingTotal: number; subtotal: number; taxTotal: number; total: number;
  glsPickupPointId?: string; glsPickupPointName?: string; glsPickupPointAddress?: string;
}) {
  if (!data.customerName || !data.customerEmail || !data.address || !data.city || !data.postalCode) {
    throw new Error("Molimo ispunite sva obavezna polja.");
  }
  if (!data.items || data.items.length === 0) throw new Error("Košarica je prazna.");

  // Fetch products from DB, validate ACTIVE + stock
  const productIds = data.items.map(i => i.productId);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, price: true, salePrice: true, status: true, stock: true },
  });
  const productMap = new Map(dbProducts.map(p => [p.id, p]));

  for (const item of data.items) {
    const p = productMap.get(item.productId);
    if (!p) throw new Error(`Proizvod "${item.productName}" više nije dostupan.`);
    if (p.status !== "ACTIVE") throw new Error(`Proizvod "${p.name}" trenutno nije dostupan.`);
    if (p.stock != null && p.stock < item.quantity) throw new Error(`Proizvod "${p.name}" nema dovoljno zaliha.`);
  }

  // Unified pricing
  const isPickup = data.shippingMethodId === "osobno-preuzimanje";
  const pricing = computePrices(
    data.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: productMap.get(i.productId)!.price, salePrice: productMap.get(i.productId)!.salePrice, stock: productMap.get(i.productId)!.stock })),
    isPickup
  );

  // Order number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await db.order.count({ where: { orderNumber: { startsWith: `ROTEA-${dateStr}` } } });
  const orderNumber = `ROTEA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  // Upsert customer
  const shippingAddress = `${data.address}, ${data.postalCode} ${data.city}`;
  let customer = await db.customer.findFirst({ where: { OR: [{ email: data.customerEmail }, { phone: data.customerPhone }] } });
  if (customer) {
    customer = await db.customer.update({ where: { id: customer.id }, data: { name: data.customerName, phone: data.customerPhone, shippingAddress } });
  } else {
    customer = await db.customer.create({ data: { name: data.customerName, email: data.customerEmail, phone: data.customerPhone, shippingAddress } });
  }

  const shippingMethod = await db.shippingMethod.findUnique({ where: { id: data.shippingMethodId } });

  const initialStatus = data.paymentMethod === "cod" ? "CONFIRMED" : "PENDING";

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber, customerId: customer.id, customerEmail: data.customerEmail, customerName: data.customerName,
      customerPhone: data.customerPhone, shippingAddress, billingAddress: shippingAddress,
      subtotal: pricing.subtotal, shippingTotal: pricing.shipping, taxTotal: pricing.tax, total: pricing.total,
      currency: "EUR", status: initialStatus, paymentStatus: "UNPAID", paymentMethod: data.paymentMethod,
      shippingMethod: shippingMethod?.name || data.shippingMethodId, note: data.note || null,
      glsPickupPointId: data.glsPickupPointId || null,
      glsPickupPointName: data.glsPickupPointName || null,
      glsPickupPointAddress: data.glsPickupPointAddress || null,
      items: {
        create: pricing.lineItems.map(li => ({
          productId: li.productId, productName: productMap.get(li.productId)!.name,
          sku: productMap.get(li.productId)!.sku || null, quantity: li.quantity,
          unitPrice: li.unitPrice, total: li.total,
        })),
      },
    },
  });

  // Payment
  await db.payment.create({
    data: { orderId: order.id, provider: "manual", method: data.paymentMethod,
      status: "UNPAID", amount: pricing.total, currency: "EUR" },
  });

  // Decrease stock immediately for bank_transfer and cod
  // For card payments, stock is decreased by webhook after payment confirmation
  if (data.paymentMethod !== "card") {
    for (const li of pricing.lineItems) {
      const product = productMap.get(li.productId);
      if (product && product.stock != null && product.stock >= li.quantity) {
        await db.product.update({ where: { id: li.productId }, data: { stock: product.stock - li.quantity } });
        await db.orderItem.updateMany({
          where: { orderId: order.id, productId: li.productId },
          data: { stockAdjustedAt: new Date() },
        });
      }
    }

    // Send customer confirmation email
    try {
      await sendEmail({
        to: data.customerEmail,
        subject: `Narudžba ${orderNumber} – potvrda`,
        html: customerEmail({
          orderNumber,
          total: pricing.total,
          paymentMethod: data.paymentMethod,
          shippingMethod: data.shippingMethodId,
          items: pricing.lineItems.map(li => ({
            name: productMap.get(li.productId)!.name,
            quantity: li.quantity,
            price: li.unitPrice,
          })),
        }),
      });
    } catch (e) {
      console.error("[EMAIL] Failed to send customer email for order", orderNumber, e);
    }

    // Send admin notification
    try {
      const adminEmail = process.env.ADMIN_ORDER_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `Nova narudžba: ${orderNumber}`,
          html: adminNewOrderEmail({
            orderNumber,
            total: pricing.total,
            paymentMethod: data.paymentMethod,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            shippingMethod: data.shippingMethodId,
            items: data.items.map(i => ({ name: i.productName, quantity: i.quantity, price: productMap.get(i.productId)!.salePrice || productMap.get(i.productId)!.price })),
          }),
        });
      }
    } catch (e) {
      console.error("[EMAIL] Failed to send admin notification for order", orderNumber, e);
    }
  }

  revalidatePath("/admin/orders");
  return order;
}

export async function getOrderByStripeSessionId(sessionId: string) {
  return db.order.findFirst({ where: { stripeCheckoutSessionId: sessionId }, include: { items: true } });
}

export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({ where: { orderNumber }, include: { items: true } });
}

export async function getOrders({ page = 1, pageSize = 20, search, status, paymentStatus }: {
  page?: number; pageSize?: number; search?: string; status?: string; paymentStatus?: string;
}) {
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ orderNumber: { contains: search } }, { customerName: { contains: search } }, { customerEmail: { contains: search } }];
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  const [orders, total] = await Promise.all([db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), db.order.count({ where })]);
  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getOrder(id: string) {
  return db.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, payments: true, customer: true } });
}

const ALLOWED_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"];
const ALLOWED_PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED", "PARTIALLY_REFUNDED"];

export async function validateOrderForCancellation(id: string): Promise<{ canCancel: boolean; reason?: string }> {
  const order = await db.order.findUnique({ where: { id }, select: { status: true, paymentMethod: true, paymentStatus: true } });
  if (!order) return { canCancel: false, reason: "Narudžba nije pronađena." };
  if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) return { canCancel: false, reason: `Narudžba sa statusom "${order.status}" ne može biti otkazana.` };
  if (order.paymentMethod === "card" && order.paymentStatus === "PAID") return { canCancel: true, reason: "Upozorenje: Narudžba je plaćena putem Stripe-a." };
  return { canCancel: true };
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth(); if (!session?.user) throw new Error("Unauthorized");
  if (!ALLOWED_STATUSES.includes(status)) throw new Error(`Nedozvoljen status: ${status}`);
  const order = await db.order.findUnique({ where: { id }, select: { status: true, paymentMethod: true, paymentStatus: true } });
  if (!order) throw new Error("Narudžba nije pronađena.");
  if (status === "CANCELLED") { const v = await validateOrderForCancellation(id); if (!v.canCancel) throw new Error(v.reason); }
  const isStripe = order.paymentMethod === "card" || order.paymentMethod === "stripe";
  if (status === "COMPLETED" && isStripe && order.paymentStatus !== "PAID") throw new Error("Nije moguće ručno dovršiti Stripe narudžbu koja nije plaćena.");
  await db.order.update({ where: { id }, data: { status, ...(status === "CANCELLED" ? { paymentStatus: "CANCELLED" } : {}) } });
  revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/orders");
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
  const session = await auth(); if (!session?.user) throw new Error("Unauthorized");
  if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) throw new Error(`Nedozvoljen status plaćanja: ${paymentStatus}`);
  if (paymentStatus === "PAID") {
    const order = await db.order.findUnique({ where: { id }, select: { paymentMethod: true } });
    if (order && (order.paymentMethod === "card" || order.paymentMethod === "stripe")) throw new Error("Nije moguće ručno postaviti Plaćeno za Stripe narudžbe.");
  }
  await db.order.update({ where: { id }, data: { paymentStatus } });
  revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/orders");
}

export async function addAdminNote(id: string, note: string) {
  const session = await auth(); if (!session?.user) throw new Error("Unauthorized");
  if (!note || note.length > 2000) throw new Error("Napomena mora biti između 1 i 2000 znakova.");
  await db.order.update({ where: { id }, data: { adminNote: note } });
  revalidatePath(`/admin/orders/${id}`);
}
