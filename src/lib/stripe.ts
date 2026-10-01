import Stripe from "stripe";

let client: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  client ??= new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return client;
}
