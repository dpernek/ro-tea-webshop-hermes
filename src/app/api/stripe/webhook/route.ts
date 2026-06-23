import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Invalid Stripe signature:", err.message);
    return NextResponse.json({ error: `Invalid signature` }, { status: 400 });
  }

  // --- DB-level idempotency via StripeEvent table ---
  try {
    await db.stripeEvent.create({
      data: { id: event.id, type: event.type, objectId: (event.data.object as any)?.id, payload: JSON.stringify(event.data.object), processed: false },
    });
  } catch {
    // Duplicate event — already processed
    return NextResponse.json({ received: true, cached: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
    }

    await db.stripeEvent.update({ where: { id: event.id }, data: { processed: true } });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// --- Handlers ---

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
  if (order?.paymentStatus === "PAID") return;

  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paidAt: new Date(),
      stripePaymentIntentId: piId || null,
      stripePaymentStatus: session.payment_status || null,
    },
  });

  await db.payment.updateMany({
    where: { orderId, provider: "stripe" },
    data: {
      status: "COMPLETED",
      stripePaymentIntentId: piId || null,
      transactionId: piId || null,
      rawResponse: JSON.stringify({ sessionId: session.id, piId, paymentStatus: session.payment_status, amountTotal: session.amount_total, currency: session.currency }),
    },
  });

  await decreaseStock(orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await db.order.update({
    where: { id: orderId },
    data: { paymentStatus: "EXPIRED", stripePaymentStatus: "expired" },
  });

  await db.payment.updateMany({
    where: { orderId, provider: "stripe" },
    data: { status: "EXPIRED", rawResponse: JSON.stringify({ sessionId: session.id, status: "expired" }) },
  });

  revalidatePath("/admin/orders");
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: pi.id },
    select: { orderId: true, order: { select: { paymentStatus: true } } },
  });
  if (!payment || payment.order?.paymentStatus === "PAID") return;

  await db.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: "PAID", status: "CONFIRMED", paidAt: new Date(), stripePaymentIntentId: pi.id, stripePaymentStatus: pi.status },
  });

  await db.payment.updateMany({
    where: { orderId: payment.orderId, provider: "stripe" },
    data: { status: "COMPLETED", transactionId: pi.id, stripePaymentIntentId: pi.id, rawResponse: JSON.stringify({ piId: pi.id, status: pi.status, amount: pi.amount, currency: pi.currency }) },
  });

  await decreaseStock(payment.orderId);
  revalidatePath("/admin/orders");
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const payment = await db.payment.findFirst({ where: { stripePaymentIntentId: pi.id }, select: { orderId: true } });
  if (!payment) return;

  const errMsg = pi.last_payment_error?.message || "Payment failed";
  await db.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: "FAILED", paymentFailedAt: new Date(), paymentErrorMessage: errMsg, stripePaymentStatus: pi.status },
  });
  await db.payment.updateMany({
    where: { orderId: payment.orderId, provider: "stripe" },
    data: { status: "FAILED", rawResponse: JSON.stringify({ piId: pi.id, status: pi.status, error: errMsg }) },
  });
  revalidatePath("/admin/orders");
}

// --- Stock management ---
async function decreaseStock(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;

  for (const item of order.items) {
    // Skip if stock was already adjusted for this item
    if (item.stockAdjustedAt) continue;

    const product = await db.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
    if (product && product.stock != null && product.stock > 0) {
      const newStock = Math.max(0, product.stock - item.quantity);
      await db.product.update({ where: { id: item.productId }, data: { stock: newStock } });
    }

    // Mark stock as adjusted to prevent double-deduction
    await db.orderItem.update({
      where: { id: item.id },
      data: { stockAdjustedAt: new Date() },
    });
  }
}
