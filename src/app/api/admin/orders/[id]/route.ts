import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  return NextResponse.json(order || null);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      // Don't allow manual PAID for Stripe orders
      if (isStripe && parsed.data.paymentStatus === "PAID") {
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

  await db.order.update({ where: { id }, data: updateData });
  return NextResponse.json({ ok: true });
}
