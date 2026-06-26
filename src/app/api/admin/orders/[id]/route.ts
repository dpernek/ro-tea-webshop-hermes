import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";
import { canTransition, validateOrderPaymentConsistency } from "@/lib/order-lifecycle";
import { sendEmail } from "@/lib/email";
import { isGlsConfigured } from "@/lib/shipping/gls/config";
import { getGlsConfig } from "@/lib/shipping/gls/config";

export const dynamic = "force-dynamic";

function emptyStringToNull(val: unknown): unknown {
  if (val === "" || val === undefined) return null;
  return val;
}

const orderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
], { error: "Status narudžbe mora biti: PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELLED ili REFUNDED" });

const paymentStatusEnum = z.enum([
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
], { error: "Status plaćanja mora biti: UNPAID, PENDING, PAID, FAILED, CANCELLED, EXPIRED ili REFUNDED" });

const orderUpdateSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  adminNote: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
}).strict();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("orders", "read");
  if (access) return access;
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json(null);

  // Attach GLS status: test mode vs configured
  let glsTestMode = false;
  let glsConfigured = false;
  try {
    glsTestMode = getGlsConfig().testMode;
    glsConfigured = isGlsConfigured();
  } catch { /* GLS env vars not set */ }

  return NextResponse.json({ ...order, glsTestMode, glsConfigured });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("orders", "write");
  if (access) return access;
  const { id } = await params;

  const raw = await req.json();
  const parsed = orderUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "_root";
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  // Validate Stripe order constraints
  if (parsed.data.status || parsed.data.paymentStatus) {
    const order = await db.order.findUnique({
      where: { id },
      select: { paymentMethod: true, status: true, paymentStatus: true },
    });

    if (order) {
      const isStripe = order.paymentMethod === "card" || order.paymentMethod === "stripe";

      // Don't allow manual PAID for Stripe orders (only block if changing TO PAID)
      if (isStripe && parsed.data.paymentStatus === "PAID" && order.paymentStatus !== "PAID") {
        return NextResponse.json(
          { errors: { paymentStatus: "Nije moguće ručno postaviti status plaćanja na 'Plaćeno' za Stripe narudžbe. Status plaćanja se ažurira automatski putem Stripe webhook-a." } },
          { status: 400 }
        );
      }

      // Don't allow COMPLETED for unpaid Stripe orders
      if (isStripe && parsed.data.status === "COMPLETED" && order.paymentStatus !== "PAID") {
        return NextResponse.json(
          { errors: { status: "Nije moguće ručno dovršiti Stripe narudžbu koja nije plaćena. Pričekajte potvrdu plaćanja putem Stripe-a." } },
          { status: 400 }
        );
      }

      // Validate CANCELLED - only PENDING/CONFIRMED/PROCESSING
      if (parsed.data.status === "CANCELLED") {
        const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];
        if (!cancellableStatuses.includes(order.status)) {
          return NextResponse.json(
            { errors: { status: `Narudžba sa statusom "${order.status}" ne može biti otkazana.` } },
            { status: 400 }
          );
        }
      }
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.paymentStatus !== undefined) updateData.paymentStatus = parsed.data.paymentStatus;
  if (parsed.data.adminNote !== undefined) updateData.adminNote = parsed.data.adminNote;

  // Read old values BEFORE update for audit + lifecycle validation
  const oldOrder = await db.order.findUnique({ where: { id }, select: { status: true, paymentStatus: true, adminNote: true } });

  // Lifecycle validation
  if (parsed.data.status && parsed.data.status !== oldOrder?.status) {
    if (!canTransition(oldOrder?.status || "", parsed.data.status as string)) {
      return NextResponse.json({ error: `Nije dopušten prijelaz iz "${oldOrder?.status}" u "${parsed.data.status}".` }, { status: 400 });
    }
  }
  if (parsed.data.paymentStatus && parsed.data.paymentStatus !== oldOrder?.paymentStatus) {
    const finalStatus = (parsed.data.status as string) || (oldOrder?.status || "");
    const consistency = validateOrderPaymentConsistency(finalStatus, parsed.data.paymentStatus as string);
    if (consistency) return NextResponse.json({ error: consistency }, { status: 400 });
  }

  await db.order.update({ where: { id }, data: updateData });

  // Status email — simplified (statusChangeEmail not exported)
  if (parsed.data.status && parsed.data.status !== oldOrder?.status) {
    try {
      const orderFull = await db.order.findUnique({ where: { id }, select: { customerEmail: true, orderNumber: true } });
      if (orderFull?.customerEmail) {
        await sendEmail({
          to: orderFull.customerEmail,
          subject: `RO-TEA - Ažuriranje narudžbe ${orderFull.orderNumber}`,
          html: `<p>Status narudžbe ${orderFull.orderNumber} promijenjen je u: <strong>${parsed.data.status}</strong>.</p>`,
        });
      }
    } catch (e) { console.error("[EMAIL] Status change email failed", e); }
  }

  return NextResponse.json({ ok: true });
}
