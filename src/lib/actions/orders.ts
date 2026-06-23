"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SHIPPING_PRICE = 6.64;
const FREE_SHIPPING_THRESHOLD = 66.36;

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  note?: string;
  items: Array<{
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    attributes?: Record<string, string>;
  }>;
  paymentMethod: string;
  shippingMethodId: string;
  shippingTotal: number;
  subtotal: number;
  taxTotal: number;
  total: number;
}) {
  // ----- VALIDATE -----
  if (!data.customerName || !data.customerEmail || !data.address || !data.city || !data.postalCode) {
    throw new Error("Molimo ispunite sva obavezna polja.");
  }
  if (!data.items || data.items.length === 0) {
    throw new Error("Košarica je prazna.");
  }

  // ----- SERVER-SIDE PRICE CALCULATION -----
  // Fetch real product prices from DB, ignoring client-provided values
  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const item of data.items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, sku: true, price: true, salePrice: true, status: true, stock: true },
    });

    if (!product) {
      throw new Error(`Proizvod "${item.productName}" više nije dostupan.`);
    }
    if (product.status !== "ACTIVE") {
      throw new Error(`Proizvod "${product.name}" trenutno nije dostupan za kupnju.`);
    }

    const realPrice = product.salePrice != null && product.salePrice < product.price
      ? product.salePrice
      : product.price;

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku || item.sku || null,
      quantity: item.quantity,
      unitPrice: realPrice,
      total: realPrice * item.quantity,
      attributes: item.attributes || null,
    });

    calculatedSubtotal += realPrice * item.quantity;
  }

  // Calculate shipping server-side
  const isPickup = data.shippingMethodId === "osobno-preuzimanje";
  let calculatedShipping = 0;
  if (!isPickup) {
    calculatedShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  }

  // Calculate tax (Croatia PDV 25%)
  const calculatedTax = Math.round(calculatedSubtotal * 0.25 * 100) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedShipping;

  // ----- GENERATE ORDER NUMBER -----
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await db.order.count({
    where: { orderNumber: { startsWith: `ROTEA-${dateStr}` } },
  });
  const orderNumber = `ROTEA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  // ----- UPSERT CUSTOMER -----
  let customer = await db.customer.findFirst({
    where: {
      OR: [{ email: data.customerEmail }, { phone: data.customerPhone }],
    },
  });

  if (customer) {
    customer = await db.customer.update({
      where: { id: customer.id },
      data: {
        name: data.customerName,
        phone: data.customerPhone || null,
        shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      },
    });
  } else {
    customer = await db.customer.create({
      data: {
        name: data.customerName,
        email: data.customerEmail || null,
        phone: data.customerPhone || null,
        shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      },
    });
  }

  // ----- SHIPPING METHOD -----
  const shippingMethod = await db.shippingMethod.findUnique({
    where: { id: data.shippingMethodId },
  });

  // ----- INITIAL STATUS -----
  let initialStatus = "PENDING";
  if (data.paymentMethod === "cod") {
    initialStatus = "CONFIRMED";
  }

  // ----- CREATE ORDER -----
  const order = await db.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      billingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      subtotal: calculatedSubtotal,
      shippingTotal: calculatedShipping,
      taxTotal: calculatedTax,
      total: calculatedTotal,
      currency: "EUR",
      status: initialStatus,
      paymentStatus: "UNPAID",
      paymentMethod: data.paymentMethod,
      shippingMethod: shippingMethod?.name || data.shippingMethodId,
      note: data.note || null,
      items: {
        create: validatedItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          attributes: item.attributes ? JSON.stringify(item.attributes) : null,
        })),
      },
    },
  });

  // ----- PAYMENT RECORD -----
  await db.payment.create({
    data: {
      orderId: order.id,
      provider: data.paymentMethod === "card" ? "stripe" : "manual",
      method: data.paymentMethod,
      status: "UNPAID",
      amount: calculatedTotal,
      currency: "EUR",
    },
  });

  // ----- DECREASE STOCK -----
  for (const item of data.items) {
    try {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true },
      });
      if (product && product.stock != null && product.stock > 0) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await db.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });
      }
    } catch {
      // Stock update failure shouldn't break the order
    }
  }

  revalidatePath("/admin/orders");
  return order;
}

// Get recent orders from DB for public checkout confirmation
export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}

// Admin: get orders with pagination
export async function getOrders({
  page = 1,
  pageSize = 20,
  search,
  status,
  paymentStatus,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
}) {
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

  return {
    orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Admin: get single order
export async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payments: true,
      customer: true,
    },
  });
}

// Admin: update order status
const ALLOWED_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
const ALLOWED_PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED", "PARTIALLY_REFUNDED"];

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error(`Nedozvoljen status: ${status}`);
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "COMPLETED") {
    updateData.paymentStatus = "PAID";
  }

  await db.order.update({ where: { id }, data: updateData });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// Admin: update payment status
export async function updatePaymentStatus(id: string, paymentStatus: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error(`Nedozvoljen status plaćanja: ${paymentStatus}`);
  }

  await db.order.update({ where: { id }, data: { paymentStatus } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// Admin: add admin note
export async function addAdminNote(id: string, note: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!note || note.length > 2000) {
    throw new Error("Napomena mora biti između 1 i 2000 znakova.");
  }

  await db.order.update({ where: { id }, data: { adminNote: note } });
  revalidatePath(`/admin/orders/${id}`);
}
