/**
 * Central server-side shipping pricing from database.
 * Admin "Dostava" is the single source of truth.
 * All prices are GROSS (with PDV included).
 */
import { db } from "@/lib/db";

export interface ShippingPrice {
  shippingPrice: number;
  freeAboveAmount: number | null;
  isFreeShipping: boolean;
  effectiveShippingTotal: number;
}

/**
 * Get shipping price for a given method and subtotal.
 * Returns 0 shipping if subtotal >= freeAboveAmount.
 */
export async function getShippingPrice(
  shippingMethodId: string | null | undefined,
  subtotal: number,
): Promise<ShippingPrice> {
  const defaultResult: ShippingPrice = {
    shippingPrice: 0,
    freeAboveAmount: null,
    isFreeShipping: true,
    effectiveShippingTotal: 0,
  };

  if (!shippingMethodId) return defaultResult;

  try {
    const method = await db.shippingMethod.findUnique({
      where: { id: shippingMethodId },
      select: { price: true, freeAboveAmount: true },
    });

    if (!method) return defaultResult;

    const price = method.price || 0;
    const freeAbove = method.freeAboveAmount ?? null;
    const isFree = freeAbove !== null && subtotal >= freeAbove;

    return {
      shippingPrice: price,
      freeAboveAmount: freeAbove,
      isFreeShipping: isFree || price === 0,
      effectiveShippingTotal: isFree || price === 0 ? 0 : price,
    };
  } catch {
    return defaultResult;
  }
}

/** TAX_RATE for Croatia — central definition */
export const TAX_RATE = 0.25;
