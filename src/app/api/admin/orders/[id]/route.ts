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
  "REFUNDED",
], { error: "Status plaćanja mora biti: UNPAID, PENDING, PAID, FAILED ili REFUNDED" });

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

  await db.order.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
