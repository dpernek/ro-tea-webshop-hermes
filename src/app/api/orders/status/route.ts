import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");

  if (!orderNumber && !sessionId) {
    return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
  }

  let order: {
    orderNumber: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number;
  } | null = null;

  if (sessionId) {
    order = await db.order.findFirst({
      where: { stripeCheckoutSessionId: sessionId },
      select: { orderNumber: true, paymentMethod: true, paymentStatus: true, total: true },
    });
  } else if (orderNumber) {
    order = await db.order.findUnique({
      where: { orderNumber },
      select: { orderNumber: true, paymentMethod: true, paymentStatus: true, total: true },
    });
  }

  if (!order) {
    return NextResponse.json({ error: "Narudžba nije pronađena" }, { status: 404 });
  }

  return NextResponse.json(order);
}
