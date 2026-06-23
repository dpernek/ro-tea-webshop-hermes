import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Track processed event IDs to ensure idempotency
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    // Read raw body (App Router: use req.text())
    const body = await req.text();

    // Get Stripe signature from headers
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Invalid signature: ${err.message}` },
        { status: 400 }
      );
    }

    // ----- IDEMPOTENCY CHECK -----
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ received: true, cached: true });
    }
    processedEvents.add(event.id);

    // Prune old event IDs to prevent memory leak (keep last 1000)
    if (processedEvents.size > 1000) {
      const entries = [...processedEvents];
      for (let i = 0; i < entries.length - 500; i++) {
        processedEvents.delete(entries[i]);
      }
    }

    // ----- HANDLE EVENTS -----
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "checkout.session.expired": {
        await handleCheckoutSessionExpired(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "payment_intent.succeeded": {
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      }

      case "payment_intent.payment_failed": {
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;
      }

      default: {
        console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("No orderId in session metadata");
    return;
  }

  // Check if already processed (idempotency via DB state)
  const existingOrder = await db.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });

  if (existingOrder?.paymentStatus === "PAID") {
    console.log(`Order ${orderId} already marked as PAID, skipping`);
    return;
  }

  // Update order
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paidAt: new Date(),
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      stripePaymentStatus: session.payment_status || null,
    },
  });

  // Update payment record
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (paymentIntentId) {
    await db.payment.updateMany({
      where: { orderId, provider: "stripe" },
      data: {
        status: "COMPLETED",
        stripePaymentIntentId: paymentIntentId,
        transactionId: paymentIntentId,
        rawResponse: JSON.stringify({
          sessionId: session.id,
          paymentIntentId,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
        }),
      },
    });
  }

  // Decrease stock for confirmed order
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (order) {
    for (const item of order.items) {
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
        // Stock update failure shouldn't break the flow
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "EXPIRED",
      stripePaymentStatus: "expired",
    },
  });

  await db.payment.updateMany({
    where: { orderId, provider: "stripe" },
    data: {
      status: "EXPIRED",
      rawResponse: JSON.stringify({
        sessionId: session.id,
        status: "expired",
      }),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  // Find order by payment intent ID
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    select: { orderId: true, order: { select: { paymentStatus: true } } },
  });

  if (!payment) return;

  if (payment.order?.paymentStatus === "PAID") return; // already processed

  await db.order.update({
    where: { id: payment.orderId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentStatus: paymentIntent.status,
    },
  });

  await db.payment.updateMany({
    where: { orderId: payment.orderId, provider: "stripe" },
    data: {
      status: "COMPLETED",
      transactionId: paymentIntent.id,
      rawResponse: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
    },
  });

  // Decrease stock
  const order = await db.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  });

  if (order) {
    for (const item of order.items) {
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
        // Non-critical
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${payment.orderId}`);
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  const payment = await db.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    select: { orderId: true },
  });

  if (!payment) return;

  const errorMessage =
    paymentIntent.last_payment_error?.message || "Payment failed";

  await db.order.update({
    where: { id: payment.orderId },
    data: {
      paymentStatus: "FAILED",
      paymentFailedAt: new Date(),
      paymentErrorMessage: errorMessage,
      stripePaymentStatus: paymentIntent.status,
    },
  });

  await db.payment.updateMany({
    where: { orderId: payment.orderId, provider: "stripe" },
    data: {
      status: "FAILED",
      rawResponse: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        error: errorMessage,
      }),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${payment.orderId}`);
}
