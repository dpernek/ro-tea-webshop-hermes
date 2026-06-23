import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Add missing columns via raw SQL
    await db.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripeCheckoutSessionId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentStatus" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentFailedAt" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentCancelledAt" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentErrorMessage" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "checkoutExpiresAt" TIMESTAMP(3);
      ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "stripeCheckoutSessionId" TEXT;
      ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
    `);

    return NextResponse.json({
      ok: true,
      message: "Stripe kolone dodane",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
