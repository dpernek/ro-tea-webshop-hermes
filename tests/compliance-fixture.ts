import type { CatalogProduct } from "../src/lib/compliance/catalog";

export function sampleProduct(
  overrides: Partial<CatalogProduct> = {}
): CatalogProduct {
  return {
    id: "tool",
    name: "Bušilica",
    sku: "SKU-1",
    type: "SIMPLE",
    price: 100,
    regularPrice: 100,
    salePrice: null,
    anchorPriceCents: 10000,
    anchorDate: "2026-09-10",
    anchorRegime: "GENERAL_2026",
    anchorConfirmedAt: new Date("2026-10-01T10:00:00Z"),
    barcode: "3850000000001",
    barcodeNotApplicable: false,
    unitMeasure: null,
    unitQuantity: null,
    unitNotApplicable: true,
    brandNotApplicable: false,
    saleLabel: null,
    stock: 3,
    stockStatus: "INSTOCK",
    updatedAt: new Date("2026-10-01T10:00:00Z"),
    category: { name: "Alati" },
    brand: { name: "Metabo" },
    variants: [],
    ...overrides,
  };
}
