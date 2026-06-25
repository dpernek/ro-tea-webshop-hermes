// Unified server-side pricing for orders.
// Line-item pricing only. Shipping is handled by src/lib/shipping-pricing.ts (DB).
import { TAX_RATE } from "./shipping-pricing";

export { TAX_RATE };

export interface PricingInput {
  product: { price: number; salePrice?: number | null };
  quantity: number;
}

export interface PricingResult {
  subtotal: number;
  tax: number;
  lineItems: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

/**
 * Compute line-item prices from product data.
 * Respects salePrice: uses salePrice if valid and lower than price.
 * Shipping is NOT computed here — use getShippingPrice() from shipping-pricing.ts.
 */
export function computePrices(
  items: Array<{ productId: string; quantity: number; price: number; salePrice?: number | null; stock?: number | null }>,
): PricingResult {
  const lineItems: PricingResult["lineItems"] = [];
  let subtotal = 0;

  for (const item of items) {
    const unitPrice =
      item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price
        ? item.salePrice
        : item.price;
    const total = unitPrice * item.quantity;
    lineItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, total });
    subtotal += total;
  }

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  return { subtotal, tax, lineItems };
}
