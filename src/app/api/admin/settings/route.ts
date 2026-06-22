import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.storeSettings.findFirst();
  return NextResponse.json(settings || {});
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const existing = await db.storeSettings.findFirst();

  if (existing) {
    await db.storeSettings.update({
      where: { id: existing.id },
      data: {
        storeName: body.storeName,
        storeEmail: body.storeEmail,
        storePhone: body.storePhone,
        storeAddress: body.storeAddress,
        currency: body.currency,
        defaultTaxRate: parseFloat(body.defaultTaxRate) || 25,
        freeShippingThreshold: body.freeShippingThreshold
          ? parseFloat(body.freeShippingThreshold)
          : null,
      },
    });
  } else {
    await db.storeSettings.create({
      data: {
        storeName: body.storeName || "RO-TEA",
        storeEmail: body.storeEmail || "",
        storePhone: body.storePhone || "",
        storeAddress: body.storeAddress || "",
        currency: body.currency || "EUR",
        defaultTaxRate: parseFloat(body.defaultTaxRate) || 25,
        freeShippingThreshold: body.freeShippingThreshold
          ? parseFloat(body.freeShippingThreshold)
          : null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
