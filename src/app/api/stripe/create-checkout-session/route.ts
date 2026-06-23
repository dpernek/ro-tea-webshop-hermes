import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const SHIPPING_PRICE = 6.64;
const FREE_SHIPPING_THRESHOLD = 66.36;

const checkoutSessionSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Košarica je prazna"),
  customerName: z.string().min(1, "Ime i prezime je obavezno"),
  customerEmail: z.string().email("Nevažeća email adresa"),
  customerPhone: z.string().min(1, "Telefon je obavezan"),
  address: z.string().min(1, "Adresa je obavezna"),
  city: z.string().min(1, "Grad je obavezan"),
  postalCode: z.string().min(1, "Poštanski broj je obavezan"),
  shippingMethodId: z.string().min(1, "Način dostave je obavezan"),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = checkoutSessionSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        fieldErrors[field] = issue.message;
      }
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const body = parsed.data;

    // ----- FETCH & VALIDATE PRODUCTS (server-side) -----
    const productIds = body.items.map((item) => item.productId);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        salePrice: true,
        status: true,
        stock: true,
        image: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; images?: string[] };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    for (const item of body.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Proizvod (${item.productId}) više nije dostupan.` },
          { status: 400 }
        );
      }
      if (product.status !== "ACTIVE") {
        return NextResponse.json(
          {
            error: `Proizvod "${product.name}" trenutno nije dostupan za kupnju.`,
          },
          { status: 400 }
        );
      }
      if (product.stock != null && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Proizvod "${product.name}" nema dovoljno zaliha.` },
          { status: 400 }
        );
      }

      const realPrice =
        product.salePrice != null && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      // Stripe expects amounts in cents
      const unitAmountCents = Math.round(realPrice * 100);

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            ...(product.image ? { images: [product.image] } : {}),
          },
          unit_amount: unitAmountCents,
        },
        quantity: item.quantity,
      });

      calculatedSubtotal += realPrice * item.quantity;
    }

    // ----- CALCULATE SHIPPING (server-side) -----
    const isPickup = body.shippingMethodId === "osobno-preuzimanje";
    let calculatedShipping = 0;
    if (!isPickup) {
      calculatedShipping =
        calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
    }

    // Calculate tax (Croatia PDV 25%)
    const calculatedTax = Math.round(calculatedSubtotal * 0.25 * 100) / 100;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    // ----- GENERATE ORDER NUMBER -----
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await db.order.count({
      where: { orderNumber: { startsWith: `ROTEA-${dateStr}` } },
    });
    const orderNumber = `ROTEA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    // ----- UPSERT CUSTOMER -----
    let customer = await db.customer.findFirst({
      where: {
        OR: [
          ...(body.customerEmail ? [{ email: body.customerEmail }] : []),
          { phone: body.customerPhone },
        ],
      },
    });

    const shippingAddress = `${body.address}, ${body.postalCode} ${body.city}`;

    if (customer) {
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          name: body.customerName,
          phone: body.customerPhone || null,
          shippingAddress,
        },
      });
    } else {
      customer = await db.customer.create({
        data: {
          name: body.customerName,
          email: body.customerEmail || null,
          phone: body.customerPhone || null,
          shippingAddress,
        },
      });
    }

    // ----- FETCH SHIPPING METHOD -----
    const shippingMethod = await db.shippingMethod.findUnique({
      where: { id: body.shippingMethodId },
    });

    // ----- CREATE ORDER (before Stripe redirect) -----
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        shippingAddress,
        billingAddress: shippingAddress,
        subtotal: calculatedSubtotal,
        shippingTotal: calculatedShipping,
        taxTotal: calculatedTax,
        total: calculatedTotal,
        currency: "EUR",
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: "card",
        shippingMethod: shippingMethod?.name || body.shippingMethodId,
        note: body.note || null,
        items: {
          create: body.items.map((item) => {
            const product = productMap.get(item.productId)!;
            const realPrice =
              product.salePrice != null && product.salePrice < product.price
                ? product.salePrice
                : product.price;
            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku || null,
              quantity: item.quantity,
              unitPrice: realPrice,
              total: realPrice * item.quantity,
            };
          }),
        },
      },
    });

    // ----- CREATE PAYMENT RECORD -----
    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        provider: "stripe",
        method: "card",
        status: "PENDING",
        amount: calculatedTotal,
        currency: "EUR",
      },
    });

    // ----- CREATE STRIPE CHECKOUT SESSION -----
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const baseUrl = siteUrl.startsWith("http")
      ? siteUrl
      : `https://${siteUrl}`;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems as any,
      mode: "payment",
      currency: "eur",
      payment_method_types: ["card"],
      customer_email: body.customerEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${baseUrl}/checkout/uspjeh?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=1`,
    });

    // ----- SAVE STRIPE SESSION ID -----
    await db.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id,
        checkoutExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        stripeCheckoutSessionId: session.id,
        rawResponse: JSON.stringify({
          sessionId: session.id,
          url: session.url,
          expiresAt: session.expires_at,
        }),
      },
    });

    revalidatePath("/admin/orders");

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout session error:", err);
    return NextResponse.json(
      { error: "Došlo je do greške prilikom kreiranja plaćanja." },
      { status: 500 }
    );
  }
}
