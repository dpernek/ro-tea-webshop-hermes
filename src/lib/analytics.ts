/**
 * Internal analytics event layer.
 * Centralized, typed, ready for external tool integration.
 */

export type AnalyticsEvent =
  | "view_product"
  | "add_to_cart"
  | "begin_checkout"
  | "apply_coupon"
  | "add_to_wishlist"
  | "remove_from_wishlist";

interface EventPayload {
  event: AnalyticsEvent;
  data?: Record<string, any>;
  timestamp: number;
}

const queue: EventPayload[] = [];

export function trackEvent(event: AnalyticsEvent, data?: Record<string, any>) {
  const payload: EventPayload = { event, data, timestamp: Date.now() };
  queue.push(payload);

  // Keep queue bounded
  if (queue.length > 100) queue.shift();

  // Log locally — replace with GA4/Pixel send when ready
  if (typeof window !== "undefined") {
    console.debug("[analytics]", event, data);
  }

  // Expose for external consumers
  if (typeof window !== "undefined") {
    (window as any).__hermes_analytics = queue;
  }
}
