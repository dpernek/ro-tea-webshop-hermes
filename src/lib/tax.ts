/** Prices in the shop include Croatian VAT. */
export const TAX_RATE = 0.25;

export function includedVat(gross: number): number {
  return Math.round((gross - gross / (1 + TAX_RATE)) * 100) / 100;
}
