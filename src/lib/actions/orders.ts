"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
  // Generate order number
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await db.order.count({
    where: {
      orderNumber: { startsWith: `ROTEA-${dateStr}` },
    },
  });
  const orderNumber = `ROTEA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  // Create or update customer
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

  // Get shipping method name
  const shippingMethod = await db.shippingMethod.findUnique({
    where: { id: data.shippingMethodId },
  });

  // Determine initial status based on payment method
  let initialStatus = "PENDING";
  let paymentStatus = "UNPAID";
  if (data.paymentMethod === "cod") {
    initialStatus = "CONFIRMED";
  }

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      billingAddress: `${data.address}, ${data.postalCode} ${data.city}`,
      subtotal: data.subtotal,
      shippingTotal: data.shippingTotal,
      taxTotal: data.taxTotal,
      total: data.total,
      currency: "EUR",
      status: initialStatus,
      paymentStatus,
      paymentMethod: data.paymentMethod,
      shippingMethod: shippingMethod?.name || data.shippingMethodId,
      note: data.note || null,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
          attributes: item.attributes ? JSON.stringify(item.attributes) : null,
        })),
      },
    },
  });

  // Create payment record
  await db.payment.create({
    data: {
      orderId: order.id,
      provider: data.paymentMethod === "card" ? "stripe" : "manual",
      method: data.paymentMethod,
      status: paymentStatus,
      amount: data.total,
      currency: "EUR",
    },
  });

  // Decrease stock for items with known stock
  for (const item of data.items) {
    try {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });
      if (product && product.stock != null) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await db.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });
      }
    } catch {
      // Don't fail the order if stock update fails
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
export async function updateOrderStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

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

  await db.order.update({ where: { id }, data: { paymentStatus } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// Admin: add admin note
export async function addAdminNote(id: string, note: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.order.update({ where: { id }, data: { adminNote: note } });
  revalidatePath(`/admin/orders/${id}`);
}
