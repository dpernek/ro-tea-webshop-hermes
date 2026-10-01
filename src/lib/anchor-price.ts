import type { Prisma } from "@/generated/client";
export const anchorFieldsSelect = {
  anchorPriceCents: true,
  anchorDate: true,
  anchorConfirmedAt: true,
} as const;
export const storefrontAnchorSelect = {
  ...anchorFieldsSelect,
  variants: {
    where: { active: true },
    orderBy: [{ price: "asc" as const }, { id: "asc" as const }],
    select: { id: true, price: true, ...anchorFieldsSelect },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export interface AnchorPriceData {
  anchorPriceCents?: number | null;
  anchorDate?: string | null;
  anchorConfirmedAt?: Date | string | null;
}
export function confirmedAnchor(item: AnchorPriceData | null | undefined) {
  return item?.anchorConfirmedAt &&
    item.anchorPriceCents != null &&
    item.anchorDate
    ? { anchorPriceCents: item.anchorPriceCents, anchorDate: item.anchorDate }
    : { anchorPriceCents: null, anchorDate: null };
}
