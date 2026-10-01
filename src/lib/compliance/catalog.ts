import { createHash } from "node:crypto";
import { z } from "zod";
import { currentProductPrice, regularProductPrice } from "../product-price";

export const REFERENCE_DATE = "2026-09-10";
export const LEGACY_REFERENCE_DATE = "2025-05-02";

export function euroCents(amount: number): number {
  const cents = Math.round((amount + Number.EPSILON) * 100);
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(cents) ||
    cents > 2147483647
  ) {
    throw new Error("Neispravan iznos cijene.");
  }
  return cents;
}

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Neispravan datum.");

export const anchorRowSchema = z
  .object({
    itemKey: z.string().min(3).max(150),
    anchorPriceCents: z.number().int().min(0).max(2147483647),
    anchorDate: date,
    anchorRegime: z.enum(["GENERAL_2026", "LEGACY_2025", "FIRST_LISTED"]),
    barcode: z.string().trim().max(100).nullable(),
    barcodeNotApplicable: z.boolean(),
    unitMeasure: z.string().trim().max(30).nullable(),
    unitQuantity: z.number().positive().finite().nullable(),
    unitNotApplicable: z.boolean(),
    brandNotApplicable: z.boolean(),
    saleLabel: z.string().trim().max(100).nullable(),
    stock: z.number().int().min(0).max(2147483647).nullable(),
    stockStatus: z.enum(["INSTOCK", "OUTOFSTOCK", "ONBACKORDER", "UNKNOWN"]),
  })
  .superRefine((row, context) => {
    const valid =
      row.anchorRegime === "GENERAL_2026"
        ? row.anchorDate === REFERENCE_DATE
        : row.anchorRegime === "LEGACY_2025"
          ? row.anchorDate === LEGACY_REFERENCE_DATE
          : row.anchorDate > REFERENCE_DATE &&
            row.anchorDate <= zagrebDate(new Date());
    if (!valid)
      context.addIssue({
        code: "custom",
        path: ["anchorDate"],
        message: "Datum ne odgovara odabranom režimu.",
      });
    if (row.barcode && row.barcodeNotApplicable)
      context.addIssue({
        code: "custom",
        path: ["barcode"],
        message: "Barkod ne može istodobno biti neprimjenjiv.",
      });
    if (row.unitNotApplicable && (row.unitMeasure || row.unitQuantity != null))
      context.addIssue({
        code: "custom",
        path: ["unitMeasure"],
        message: "Jedinica ne može istodobno biti neprimjenjiva.",
      });
  });

export const confirmationSchema = z.object({
  fingerprint: z.string().length(64),
  source: z.string().trim().min(10).max(2000),
  acknowledgeReferenceDates: z.literal(true),
  acknowledgeUnchangedPrices: z.literal(true),
  rows: z.array(anchorRowSchema).min(1).max(30000),
});
export type AnchorRow = z.infer<typeof anchorRowSchema>;

export const catalogSelect = {
  id: true,
  name: true,
  sku: true,
  type: true,
  price: true,
  regularPrice: true,
  salePrice: true,
  anchorPriceCents: true,
  anchorDate: true,
  anchorRegime: true,
  anchorConfirmedAt: true,
  barcode: true,
  barcodeNotApplicable: true,
  unitMeasure: true,
  unitQuantity: true,
  unitNotApplicable: true,
  brandNotApplicable: true,
  saleLabel: true,
  stock: true,
  stockStatus: true,
  updatedAt: true,
  category: { select: { name: true } },
  brand: { select: { name: true } },
  variants: {
    where: { active: true },
    orderBy: { id: "asc" as const },
    select: {
      id: true,
      sku: true,
      price: true,
      attributes: true,
      stock: true,
      updatedAt: true,
      anchorPriceCents: true,
      anchorDate: true,
      anchorRegime: true,
      anchorConfirmedAt: true,
      barcode: true,
      barcodeNotApplicable: true,
      unitMeasure: true,
      unitQuantity: true,
      unitNotApplicable: true,
    },
  },
} as const;

type AnchorFields = {
  anchorPriceCents: number | null;
  anchorDate: string | null;
  anchorRegime: string | null;
  anchorConfirmedAt: Date | null;
};
export interface CatalogProduct extends AnchorFields {
  id: string;
  name: string;
  sku: string | null;
  type: string;
  price: number;
  regularPrice: number | null;
  salePrice: number | null;
  barcode: string | null;
  barcodeNotApplicable: boolean;
  unitMeasure: string | null;
  unitQuantity: number | null;
  unitNotApplicable: boolean;
  brandNotApplicable: boolean;
  saleLabel: string | null;
  stock: number | null;
  stockStatus: string;
  updatedAt: Date;
  category: { name: string } | null;
  brand: { name: string } | null;
  variants: Array<
    AnchorFields & {
      id: string;
      sku: string | null;
      price: number;
      attributes: string;
      stock: number | null;
      updatedAt: Date;
      barcode: string | null;
      barcodeNotApplicable: boolean;
      unitMeasure: string | null;
      unitQuantity: number | null;
      unitNotApplicable: boolean;
    }
  >;
}

export function catalogFingerprint(products: CatalogProduct[]): string {
  return createHash("sha256").update(JSON.stringify(products)).digest("hex");
}

type CatalogItem = {
  itemKey: string;
  product: CatalogProduct;
  variant: CatalogProduct["variants"][number] | null;
};
export function catalogItems(products: CatalogProduct[]): CatalogItem[] {
  return products.flatMap<CatalogItem>((product) =>
    product.type === "VARIABLE"
      ? product.variants.map((variant) => ({
          itemKey: `v:${variant.id}`,
          product,
          variant,
        }))
      : [{ itemKey: `p:${product.id}`, product, variant: null }]
  );
}

export function reviewTemplate(products: CatalogProduct[]) {
  return {
    fingerprint: catalogFingerprint(products),
    rows: catalogItems(products).map(({ itemKey, product, variant }) => {
      const item = variant ?? product;
      return {
        itemKey,
        productId: product.id,
        name: product.name,
        sku: item.sku,
        category: product.category?.name ?? "",
        attributes: variant?.attributes ?? null,
        anchorPriceCents:
          item.anchorPriceCents ??
          euroCents(variant ? variant.price : regularProductPrice(product)),
        anchorDate: item.anchorDate ?? REFERENCE_DATE,
        anchorRegime: item.anchorRegime ?? "GENERAL_2026",
        barcode: item.barcode,
        barcodeNotApplicable: item.barcodeNotApplicable,
        unitMeasure: item.unitMeasure,
        unitQuantity: item.unitQuantity,
        unitNotApplicable: item.unitNotApplicable,
        brandNotApplicable: product.brandNotApplicable,
        saleLabel: product.saleLabel,
        stock: item.stock,
        stockStatus: variant
          ? variant.stock == null
            ? "UNKNOWN"
            : variant.stock > 0
              ? "INSTOCK"
              : "OUTOFSTOCK"
          : product.stockStatus,
      };
    }),
  };
}

export function validateConfirmation(
  products: CatalogProduct[],
  rows: AnchorRow[]
): string[] {
  const items = catalogItems(products);
  const lookup = new Map(items.map((item) => [item.itemKey, item]));
  const seen = new Set<string>();
  const errors: string[] = [];
  const parentMetadata = new Map<string, string>();
  for (const row of rows) {
    const item = lookup.get(row.itemKey);
    if (!item) {
      errors.push(`${row.itemKey}: artikl nije u aktivnom asortimanu.`);
      continue;
    }
    if (seen.has(row.itemKey)) errors.push(`${row.itemKey}: ponovljen redak.`);
    seen.add(row.itemKey);
    const current = item.variant ?? item.product;
    // Corrections require a separate reviewed process, never a blanket re-import.
    if (
      current.anchorConfirmedAt &&
      (current.anchorPriceCents !== row.anchorPriceCents ||
        current.anchorDate !== row.anchorDate ||
        current.anchorRegime !== row.anchorRegime)
    ) {
      errors.push(
        `${row.itemKey}: već potvrđeno sidro ne može se prepisati ovim uvozom.`
      );
    }
    const metadata = JSON.stringify([row.brandNotApplicable, row.saleLabel]);
    const previous = parentMetadata.get(item.product.id);
    if (previous && previous !== metadata)
      errors.push(
        `${row.itemKey}: zajednički podaci proizvoda razlikuju se među varijantama.`
      );
    parentMetadata.set(item.product.id, metadata);
  }
  for (const item of items)
    if (!seen.has(item.itemKey))
      errors.push(`${item.itemKey}: nedostaje redak.`);
  for (const product of products)
    if (product.type === "VARIABLE" && !product.variants.length)
      errors.push(`${product.name}: nema aktivnih varijanti.`);
  return errors;
}

export function zagrebDate(now: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function fileTimestamp(now: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}_${values.hour}-${values.minute}-${values.second}`;
}

// Quoted UTF-8 CSV, semicolon delimiter. Neutralize spreadsheet formula cells.
function cell(value: string | number): string {
  let text = String(value);
  if (/^[\s\uFEFF]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
const decimal = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

export function buildPriceList(products: CatalogProduct[]) {
  const errors: string[] = [];
  const rows: Array<Array<string | number>> = [];
  for (const product of products)
    if (product.type === "VARIABLE" && !product.variants.length)
      errors.push(`${product.name}: nema aktivnih varijanti.`);
  for (const { itemKey, product, variant } of catalogItems(products)) {
    const item = variant ?? product;
    const label = `${product.name} (${item.sku || itemKey})`;
    if (
      item.anchorPriceCents == null ||
      !item.anchorDate ||
      !item.anchorRegime ||
      !item.anchorConfirmedAt
    )
      errors.push(`${label}: sidro nije potvrđeno.`);
    const stockStatus = variant
      ? variant.stock == null
        ? "UNKNOWN"
        : variant.stock > 0
          ? "INSTOCK"
          : "OUTOFSTOCK"
      : product.stockStatus;
    const validation = anchorRowSchema.safeParse({
      itemKey,
      anchorPriceCents: item.anchorPriceCents,
      anchorDate: item.anchorDate,
      anchorRegime: item.anchorRegime,
      barcode: item.barcode,
      barcodeNotApplicable: item.barcodeNotApplicable,
      unitMeasure: item.unitMeasure,
      unitQuantity: item.unitQuantity,
      unitNotApplicable: item.unitNotApplicable,
      brandNotApplicable: product.brandNotApplicable,
      saleLabel: product.saleLabel,
      stock: item.stock,
      stockStatus,
    });
    if (!validation.success)
      errors.push(`${label}: neispravni podaci sidra, jedinice ili zalihe.`);
    if (!product.name.trim()) errors.push(`${label}: nedostaje naziv.`);
    if (!product.brand?.name && !product.brandNotApplicable)
      errors.push(`${label}: marka nije definirana.`);
    if (!item.barcode && !item.barcodeNotApplicable)
      errors.push(`${label}: barkod nije definiran.`);
    if (
      !item.unitNotApplicable &&
      (!item.unitMeasure || !item.unitQuantity || item.unitQuantity <= 0)
    )
      errors.push(`${label}: jedinica/količina nije definirana.`);
    if (
      item.stock == null &&
      !["INSTOCK", "OUTOFSTOCK", "ONBACKORDER"].includes(stockStatus)
    )
      errors.push(`${label}: raspoloživost nije poznata.`);
    const amount = variant ? variant.price : currentProductPrice(product);
    const sale = !variant && amount < regularProductPrice(product);
    if (sale && !product.saleLabel?.trim())
      errors.push(`${label}: nedostaje naziv posebnog oblika prodaje.`);
    const name = variant
      ? `${product.name} — ${variant.attributes}`
      : product.name;
    let cents = 0;
    try {
      cents = euroCents(amount);
    } catch {
      errors.push(`${label}: neispravna prodajna cijena.`);
    }
    rows.push([
      name,
      item.sku || itemKey,
      product.brand?.name ?? "",
      item.unitNotApplicable ? "" : (item.unitMeasure ?? ""),
      item.unitNotApplicable || !item.unitQuantity
        ? ""
        : decimal(Math.round(cents / item.unitQuantity)),
      decimal(cents),
      sale ? "DA" : "NE",
      sale ? (product.saleLabel ?? "") : "",
      item.anchorPriceCents == null ? "" : decimal(item.anchorPriceCents),
      item.barcode ?? "",
      item.stock != null
        ? item.stock > 0
          ? "dostupno"
          : "nedostupno"
        : stockStatus === "INSTOCK"
          ? "dostupno"
          : "nedostupno",
      item.anchorDate ?? "",
      itemKey,
    ]);
  }
  if (!rows.length) errors.push("Aktivni asortiman je prazan.");
  const header = [
    "naziv",
    "sifra",
    "marka",
    "jedinica_mjere",
    "cijena_za_jedinicu_mjere",
    "maloprodajna_cijena",
    "poseban_oblik_prodaje",
    "naziv_posebnog_oblika_prodaje",
    "sidrena_cijena",
    "barkod",
    "raspolozivost",
    "datum_sidrene_cijene",
    "identitet_artikla",
  ];
  const content =
    "\uFEFF" +
    [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n") +
    "\r\n";
  return { content, rowCount: rows.length, errors };
}
