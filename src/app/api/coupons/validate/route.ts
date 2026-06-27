import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const validateSchema = z.object({
  code: z.string().min(1, "Unesite kod kupona.").max(50, "Kod kupona je predugačak.").transform((v) => v.trim().toUpperCase()),
  subtotal: z.number().min(0, "Iznos ne može biti negativan.").optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = validateSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      return NextResponse.json({ valid: false, errors: fieldErrors }, { status: 400 });
    }

    const { code, subtotal } = parsed.data;

    const coupon = await db.coupon.findFirst({
      where: { code: { equals: code, mode: "insensitive" }, active: true },
    });

    if (!coupon) return NextResponse.json({ valid: false, error: "Kupon nije pronađen ili nije aktivan." }, { status: 404 });

    // Date range checks
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      return NextResponse.json({ valid: false, error: "Kupon još nije aktivan." });
    }
    if (coupon.endsAt && new Date(coupon.endsAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Kupon je istekao." });
    }

    // Min order
    if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimalni iznos narudžbe za ovaj kupon je ${coupon.minimumOrderAmount.toFixed(2)} €.`,
      });
    }

    // Usage limit
    const limit = coupon.usageLimit || 0;
    const used = coupon.usedCount || 0;
    if (limit > 0 && used >= limit) {
      return NextResponse.json({ valid: false, error: "Kupon je dosegao maksimalni broj korištenja." });
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
