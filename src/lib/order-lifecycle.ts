/**
 * Order lifecycle — strict status transition model.
 * Phase 2: valid transitions, state consistency rules.
 */

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED", "REFUNDED"] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

/** Valid order status transitions. */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["COMPLETED"],
  COMPLETED:  ["REFUNDED"],
  CANCELLED:  [],
  REFUNDED:   [],
};

/** Check if a transition is allowed. */
export function canTransition(from: string, to: string): boolean {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

/** Get all valid next statuses from current. */
export function nextStatuses(current: string): string[] {
  return ALLOWED_TRANSITIONS[current] || [];
}

/** Validate that order status and payment status are logically consistent. */
export function validateOrderPaymentConsistency(orderStatus: string, paymentStatus: string): string | null {
  // Completed order must be paid
  if (orderStatus === "COMPLETED" && paymentStatus !== "PAID") {
    return "Završena narudžba mora imati status plaćanja 'Plaćeno'.";
  }
  // Refunded order must have refunded payment
  if (orderStatus === "REFUNDED" && paymentStatus !== "REFUNDED") {
    return "Refundirana narudžba mora imati status plaćanja 'Refundirano'.";
  }
  // Cancelled order should not be PAID (unless refunded)
  if (orderStatus === "CANCELLED" && paymentStatus === "PAID") {
    return "Otkazana narudžba ne može imati status plaćanja 'Plaćeno'. Refundirajte prvo.";
  }
  return null; // OK
}

/** Human-readable labels. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Na čekanju", CONFIRMED: "Potvrđeno", PROCESSING: "U obradi",
  SHIPPED: "Poslano", COMPLETED: "Završeno", CANCELLED: "Otkazano", REFUNDED: "Refundirano",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Nije plaćeno", PENDING: "Plaćanje u tijeku", PAID: "Plaćeno",
  FAILED: "Neuspjelo", CANCELLED: "Otkazano", EXPIRED: "Isteklo", REFUNDED: "Refundirano",
};
