import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { computePrices } from "@/lib/pricing";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const checkoutSessionSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1) })).min(1, "Košarica je prazna"),
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
      for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }
    const body = parsed.data;

    // Fetch & validate products from DB
    const dbProducts = await db.product.findMany({
      where: { id: { in: body.items.map(i => i.productId) } },
      select: { id: true, name: true, sku: true, price: true, salePrice: true, status: true, stock: true, image: true },
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    for (const item of body.items) {
      const p = productMap.get(item.productId);
      if (!p) return NextResponse.json({ error: `Proizvod (${item.productId}) više nije dostupan.` }, { status: 400 });
      if (p.status !== "ACTIVE") return NextResponse.json({ error: `Proizvod "${p.name}" trenutno nije dostupan.` }, { status: 400 });
      if (p.stock != null && p.stock > 0 && p.stock < item.quantity) return NextResponse.json({ error: `Proizvod "${p.name}" nema dovoljno zaliha.` }, { status: 400 });
    }

    // Unified server-side pricing
    const isPickup = body.shippingMethodId === "osobno-preuzimanje";
    const pricing = computePrices(
      body.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: productMap.get(i.productId)!.price, salePrice: productMap.get(i.productId)!.salePrice, stock: productMap.get(i.productId)!.stock })),
      isPickup
    );

    // Stripe line items in cents
    const lineItems = pricing.lineItems.map(li => ({
      price_data: { currency: "eur", product_data: { name: productMap.get(li.productId)!.name }, unit_amount: Math.round(li.unitPrice * 100) },
      quantity: li.quantity,
    }));

    // Generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await db.order.count({ where: { orderNumber: { startsWith: `ROTEA-${dateStr}` } } });
    const orderNumber = `ROTEA-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    // Upsert customer
    const shippingAddress = `${body.address}, ${body.postalCode} ${body.city}`;
    let customer = await db.customer.findFirst({ where: { OR: [{ email: body.customerEmail }, { phone: body.customerPhone }] } });
    if (customer) {
      customer = await db.customer.update({ where: { id: customer.id }, data: { name: body.customerName, phone: body.customerPhone, shippingAddress } });
    } else {
      customer = await db.customer.create({ data: { name: body.customerName, email: body.customerEmail, phone: body.customerPhone, shippingAddress } });
    }

    // Fetch shipping method
    const shippingMethod = await db.shippingMethod.findUnique({ where: { id: body.shippingMethodId } });

    // Create order BEFORE Stripe redirect
    const order = await db.order.create({
      data: {
        orderNumber, customerId: customer.id, customerEmail: body.customerEmail, customerName: body.customerName,
        customerPhone: body.customerPhone, shippingAddress, billingAddress: shippingAddress,
        subtotal: pricing.subtotal, shippingTotal: pricing.shipping, taxTotal: pricing.tax, total: pricing.total,
        currency: "EUR", status: "PENDING", paymentStatus: "UNPAID", paymentMethod: "card",
        shippingMethod: shippingMethod?.name || body.shippingMethodId, note: body.note || null,
        items: {
          create: pricing.lineItems.map(li => ({
            productId: li.productId, productName: productMap.get(li.productId)!.name,
            sku: productMap.get(li.productId)!.sku || null, quantity: li.quantity,
            unitPrice: li.unitPrice, total: li.total,
          })),
        },
      },
    });

    // Create payment record
    await db.payment.create({
      data: { orderId: order.id, provider: "stripe", method: "card", status: "PENDING", amount: pricing.total, currency: "EUR" },
    });

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "https://ro-tea-webshop-hermes.vercel.app";
    const baseUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems as any,
      mode: "payment",
      currency: "eur",
      payment_method_types: ["card"],
      customer_email: body.customerEmail,
      shipping_options: pricing.shipping > 0 ? [{
        shipping_rate_data: {
          display_name: "Dostava",
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(pricing.shipping * 100), currency: "eur" },
        },
      }] : [],
      metadata: { orderId: order.id, orderNumber },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=1`,
    });

    // Save Stripe session ID
    await db.order.update({ where: { id: order.id }, data: { stripeCheckoutSessionId: session.id, checkoutExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    await db.payment.updateMany({ where: { orderId: order.id }, data: { stripeCheckoutSessionId: session.id } });

    revalidatePath("/admin/orders");
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: `Greška: ${err?.message || "Došlo je do greške."}` }, { status: 500 });
  }
}
