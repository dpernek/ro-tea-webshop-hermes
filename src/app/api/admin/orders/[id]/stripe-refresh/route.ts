import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/orders/[id]/stripe-refresh
 * Fetch the latest payment status from Stripe and sync it with the order.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin();
  if (access) {
    return access;
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      stripeCheckoutSessionId: true,
      stripePaymentIntentId: true,
      paymentMethod: true,
      paymentStatus: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena." }, { status: 404 });
  }

  if (!order.stripeCheckoutSessionId && !order.stripePaymentIntentId) {
    return NextResponse.json(
      { error: "Ova narudžba nema Stripe podatke za osvježavanje." },
      { status: 400 }
    );
  }

  try {
    const updateData: Record<string, unknown> = {};

    // Fetch from Stripe: prefer payment intent, fallback to checkout session
    if (order.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

      // Map Stripe status to our payment status
      const stripeToLocalStatus: Record<string, string> = {
        requires_payment_method: "UNPAID",
        requires_confirmation: "UNPAID",
        requires_action: "PENDING",
        processing: "PENDING",
        requires_capture: "PENDING",
        canceled: "CANCELLED",
        succeeded: "PAID",
      };

      const localStatus = stripeToLocalStatus[paymentIntent.status] || "PENDING";
      updateData.stripePaymentStatus = paymentIntent.status;
      updateData.paymentStatus = localStatus;

      if (paymentIntent.status === "succeeded" && !order.paymentStatus) {
        updateData.paidAt = new Date();
      }

      if (paymentIntent.last_payment_error) {
        updateData.paymentErrorMessage =
          paymentIntent.last_payment_error.message || "Stripe payment error";
        updateData.paymentFailedAt = new Date();
      }
    } else if (order.stripeCheckoutSessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        order.stripeCheckoutSessionId
      );

      const stripeToLocalStatus: Record<string, string> = {
        open: "PENDING",
        complete: "PAID",
        expired: "EXPIRED",
      };

      const localStatus = stripeToLocalStatus[checkoutSession.status || ""] || "PENDING";
      updateData.stripePaymentStatus = checkoutSession.status;
      updateData.paymentStatus = localStatus;

      // If session is complete and we have a payment intent
      if (
        checkoutSession.payment_intent &&
        typeof checkoutSession.payment_intent === "string"
      ) {
        updateData.stripePaymentIntentId = checkoutSession.payment_intent;

        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            checkoutSession.payment_intent
          );

          const piLocalStatus: Record<string, string> = {
            requires_payment_method: "UNPAID",
            requires_confirmation: "UNPAID",
            requires_action: "PENDING",
            processing: "PENDING",
            requires_capture: "PENDING",
            canceled: "CANCELLED",
            succeeded: "PAID",
          };

          updateData.stripePaymentStatus = paymentIntent.status;
          updateData.paymentStatus = piLocalStatus[paymentIntent.status] || "PENDING";

          if (paymentIntent.status === "succeeded") {
            updateData.paidAt = new Date();
          }

          if (paymentIntent.last_payment_error) {
            updateData.paymentErrorMessage =
              paymentIntent.last_payment_error.message || "Stripe payment error";
            updateData.paymentFailedAt = new Date();
          }
        } catch {
          // Payment intent fetch failed, keep session-level data
        }
      } else {
        if (checkoutSession.status === "complete") {
          updateData.paidAt = new Date();
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Nema promjena sa Stripe-a.", order });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Stripe refresh error:", error);
    return NextResponse.json(
      { error: `Greška pri dohvatu Stripe podataka: ${error.message || "Nepoznata greška"}` },
      { status: 500 }
    );
  }
}
