// Unified server-side pricing for orders. Single source of truth.
// All price calculations MUST go through this module.

export const SHIPPING_PRICE = 8;
export const FREE_SHIPPING_THRESHOLD = 70;
export const TAX_RATE = 0.25; // Croatia PDV

export interface PricingInput {
  product: {
    price: number;
    salePrice?: number | null;
  };
  quantity: number;
}

export interface PricingResult {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  lineItems: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

/**
 * Compute line-item and aggregate pricing from DB product data.
 * Respects salePrice: uses salePrice if valid and lower than price.
 */
export function computePrices(
  items: Array<{ productId: string; quantity: number; price: number; salePrice?: number | null; stock?: number | null }>,
  isPickup: boolean
): PricingResult {
  const lineItems: PricingResult["lineItems"] = [];
  let subtotal = 0;

  for (const item of items) {
    const unitPrice =
      item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price
        ? item.salePrice
        : item.price;
    const total = unitPrice * item.quantity;
    lineItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      total,
    });
    subtotal += total;
  }

  const shipping = isPickup ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  const total = Math.round((subtotal + shipping) * 100) / 100;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  return { subtotal, shipping, tax, total, lineItems };
}
