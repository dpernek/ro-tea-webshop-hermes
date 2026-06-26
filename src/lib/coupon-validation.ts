import { db } from "@/lib/db";

interface ValidatedCoupon {
  code: string;
  discount: number;
  type: string;
}

/** Server-side coupon validation. Returns null if invalid. */
export async function validateCoupon(code: string, subtotal: number): Promise<ValidatedCoupon | null> {
  if (!code?.trim()) return null;

  const coupon = await db.coupon.findFirst({
    where: { code: { equals: code.trim(), mode: "insensitive" }, active: true },
  });

  if (!coupon) return null;

  // Date range
  if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) return null;
  if (coupon.endsAt && new Date(coupon.endsAt) < new Date()) return null;

  // Min order
  if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) return null;

  // Usage limit
  const limit = coupon.usageLimit || 0;
  if (limit > 0 && (coupon.usedCount || 0) >= limit) return null;

  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = subtotal * (coupon.value / 100);
  } else if (coupon.type === "FIXED") {
    discount = Math.min(coupon.value, subtotal);
  }

  return {
    code: coupon.code,
    discount: Math.round(discount * 100) / 100,
    type: coupon.type,
  };
}
