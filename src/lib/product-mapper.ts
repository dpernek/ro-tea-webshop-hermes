import { confirmedAnchor } from "./anchor-price";
import { currentProductPrice } from "./product-price";
/**
 * Shared product mapper — transforms raw Prisma product to storefront shape.
 * Used by catalog (server actions), category pages, and brand pages.
 * Ensures consistent shape for ProductGrid / ProductCard.
 */

export function mapProduct(p: any) {
  const cheapest = p.type === "VARIABLE" ? p.variants?.[0] : null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku ?? null,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? "",
    categorySlug: p.category?.slug ?? "",
    price: cheapest?.price ?? currentProductPrice(p),
    ...confirmedAnchor(p.type === "VARIABLE" ? cheapest : p),
    regularPrice: cheapest ? null : p.regularPrice ?? null,
    salePrice: cheapest ? null : p.salePrice ?? null,
    oldPrice: !cheapest && p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    image: p.image,
    gallery: [] as string[],
    shortDescription: p.shortDescription ?? "",
    description: "",
    featured: p.featured ?? false,
    badge: p.badge ?? null,
    type: (p.type?.toLowerCase() ?? "simple") as any,
    stock: p.stock ?? null,
    stockStatus: (p.stockStatus?.toLowerCase() ?? "unknown") as any,
    priceRange: cheapest ? { min: cheapest.price, max: cheapest.price } : p.priceRangeMin != null ? { min: p.priceRangeMin, max: p.priceRangeMax ?? p.priceRangeMin } : (p.priceRange ?? null),
  };
}
