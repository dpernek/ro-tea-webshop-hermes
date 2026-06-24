import { z } from "zod";

// ── Product ──
export const productSchema = z.object({
  name: z.string().min(1, "Naziv je obavezan"),
  slug: z.string().min(1, "Slug je obavezan"),
  sku: z.string().optional().default(""),
  price: z.number({ error: "Cijena mora biti broj" }).min(0, "Cijena ne može biti negativna"),
  regularPrice: z.number().min(0).optional().nullable(),
  salePrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).optional().default(0),
  stockStatus: z.enum(["INSTOCK", "OUTOFSTOCK", "ONBACKORDER", "UNKNOWN"]).default("UNKNOWN"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
  badge: z.string().optional().default(""),
  type: z.enum(["SIMPLE", "VARIABLE", "UNKNOWN"]).default("SIMPLE"),
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  benefits: z.string().optional().default(""),
  usage: z.string().optional().default(""),
  warranty: z.string().optional().default(""),
  deliveryNote: z.string().optional().default(""),
  image: z.string().min(1, "URL slike je obavezan"),
  brandId: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ── Category inline edit ──
export const categorySchema = z.object({
  name: z.string().min(1, "Naziv kategorije je obavezan"),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().min(0, "Redoslijed ne može biti negativan").default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ── Brand inline edit ──
export const brandSchema = z.object({
  name: z.string().min(1, "Naziv brenda je obavezan"),
  description: z.string().optional().default(""),
});

export type BrandFormData = z.infer<typeof brandSchema>;

// ── Shipping create / edit ──
export const shippingSchema = z.object({
  name: z.string().min(1, "Naziv metode je obavezan"),
  description: z.string().optional().default(""),
  price: z.number({ error: "Cijena mora biti broj" }).min(0, "Cijena ne može biti negativna"),
  freeAboveAmount: z
    .union([z.number().min(0), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null ? null : v))
    .nullable(),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

// ── Coupon create / edit ──
export const couponSchema = z.object({
  code: z.string().min(1, "Kod kupona je obavezan").max(50, "Kod je predugačak (max 50)"),
  type: z.enum(["PERCENTAGE", "FIXED"], { error: "Vrsta kupona je obavezna" }),
  value: z
    .number({ error: "Vrijednost mora biti broj" })
    .min(0, "Vrijednost ne može biti negativna"),
  active: z.boolean().default(true),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
  minimumOrderAmount: z.union([z.number().min(0), z.literal(""), z.null()]).optional().nullable(),
  usageLimit: z.union([z.number().int().min(0), z.literal(""), z.null()]).optional().nullable(),
});

export type CouponFormData = z.infer<typeof couponSchema>;

// ── Payment create ──
export const paymentSchema = z.object({
  orderId: z.string().min(1, "Narudžba je obavezna"),
  provider: z.string().default("manual"),
  method: z.string().min(1, "Metoda plaćanja je obavezna"),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).default("PENDING"),
  transactionId: z.string().optional().default(""),
  amount: z.number({ error: "Iznos mora biti broj" }).min(0.01, "Iznos mora biti veći od 0"),
  currency: z.string().default("EUR"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// ── Helper: extract field-level errors from ZodError ──
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}
