export interface CheckoutShippingMethod {
  name: string;
  active: boolean;
  price: number;
  freeAboveAmount: number | null;
}

/** Calculate gross shipping from the current database record, never client totals. */
export function calculateShippingTotal(
  method: CheckoutShippingMethod | null,
  subtotal: number,
  pickupPointId?: string,
): number {
  if (!method?.active) {
    throw new Error("Odabrani način dostave više nije dostupan.");
  }
  if (method.name === "GLS Paketomat" && !pickupPointId?.trim()) {
    throw new Error("Molimo odaberite GLS paketomat.");
  }
  return method.freeAboveAmount !== null && subtotal >= method.freeAboveAmount
    ? 0
    : method.price;
}
