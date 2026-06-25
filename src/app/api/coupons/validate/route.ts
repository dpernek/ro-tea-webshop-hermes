import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Unesite kod kupona." }, { status: 400 });
    }

    const coupon = await (db as any).coupon?.findFirst({
      where: { code: { equals: code, mode: "insensitive" }, active: true },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Kupon nije pronađen ili nije aktivan." }, { status: 404 });
    }

    // Check min order
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimalni iznos narudžbe za ovaj kupon je ${coupon.minOrderAmount.toFixed(2)} €.`,
      });
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Kupon je istekao." });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Kupon je već iskorišten maksimalni broj puta." });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = subtotal * (coupon.value / 100);
    } else if (coupon.type === "FIXED") {
      discount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: Math.round(discount * 100) / 100,
      type: coupon.type,
    });

  } catch {
    return NextResponse.json({ valid: false, error: "Greška pri provjeri kupona." }, { status: 500 });
  }
}
