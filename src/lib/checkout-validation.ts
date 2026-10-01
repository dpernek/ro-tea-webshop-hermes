import { z } from "zod";

// Prices, totals and product names are deliberately excluded: only the database
// can supply those values, regardless of what a browser sends.
export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(1),
    quantity: z.number().int().positive(),
  })).min(1, "Košarica je prazna").refine(
    items => new Set(items.map(item => item.productId)).size === items.length,
    "Proizvod se može pojaviti samo jednom u košarici",
  ),
  customerName: z.string().trim().min(1, "Ime i prezime je obavezno"),
  customerEmail: z.string().trim().email("Nevažeća email adresa"),
  customerPhone: z.string().trim().min(1, "Telefon je obavezan"),
  address: z.string().trim().min(1, "Adresa je obavezna"),
  city: z.string().trim().min(1, "Grad je obavezan"),
  postalCode: z.string().trim().min(1, "Poštanski broj je obavezan"),
  shippingMethodId: z.string().trim().min(1, "Način dostave je obavezan"),
  note: z.string().optional(),
  glsPickupPointId: z.string().trim().optional(),
  glsPickupPointName: z.string().optional(),
  glsPickupPointAddress: z.string().optional(),
  couponCode: z.string().optional(),
});

export const manualCheckoutSchema = checkoutSchema.extend({
  paymentMethod: z.enum(["bank_transfer", "cod"]),
});
