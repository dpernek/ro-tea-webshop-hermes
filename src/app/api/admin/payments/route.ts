import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { paymentSchema, formatZodErrors } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await requirePermission("payments", "write");
  if (access) return access;

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const orderId = url.searchParams.get("orderId") || "";
  const method = url.searchParams.get("method") || "";
  const status = url.searchParams.get("status") || "";
  const amountMin = url.searchParams.get("amountMin") || "";
  const amountMax = url.searchParams.get("amountMax") || "";

  const where: any = {};
  if (orderId) where.orderId = orderId;
  if (method) where.method = method;
  if (status) where.status = status;
  if (amountMin || amountMax) {
    where.amount = {};
    if (amountMin) where.amount.gte = parseFloat(amountMin);
    if (amountMax) where.amount.lte = parseFloat(amountMax);
  }

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true, customerName: true } } },
    }),
    db.payment.count({ where }),
  ]);

  return NextResponse.json({ payments, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("payments", "write");
  if (access) return access;

  const body = await req.json();
  const result = paymentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validacija nije uspjela", fieldErrors: formatZodErrors(result.error) },
      { status: 400 }
    );
  }

  const payment = await db.payment.create({ data: result.data });
  return NextResponse.json(payment, { status: 201 });
}
