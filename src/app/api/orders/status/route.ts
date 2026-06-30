import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  if (!orderNumber && !sessionId) return NextResponse.json({ error: "Missing parameter" }, { status: 400 });

  const where = sessionId
    ? { stripeCheckoutSessionId: sessionId }
    : { orderNumber: orderNumber || "" };

  const order = await (db as any).order.findFirst({
    where,
    select: {
      orderNumber: true, paymentMethod: true, paymentStatus: true, status: true,
      subtotal: true, shippingTotal: true, discountTotal: true, couponCode: true, couponDiscount: true,
      total: true, shippingMethod: true, shippingAddress: true,
      glsPickupPointId: true, glsPickupPointName: true, glsPickupPointAddress: true, glsParcelNumber: true,
      customerName: true, customerEmail: true, customerPhone: true, city: true, postalCode: true,
      orderItems: { select: { productName: true, quantity: true, unitPrice: true } },
    },
  }) as any;

  if (!order) return NextResponse.json({ error: "Narudžba nije pronađena" }, { status: 404 });
  return NextResponse.json(order);
}
