/**
 * Shared product mapper — transforms raw Prisma product to storefront shape.
 * Used by catalog (server actions), category pages, and brand pages.
 * Ensures consistent shape for ProductGrid / ProductCard.
 */

export function mapProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku ?? null,
    brand: p.brand?.name ?? null,
    category: p.category?.name ?? "",
    categorySlug: p.category?.slug ?? "",
    price: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price,
    regularPrice: p.regularPrice ?? null,
    salePrice: p.salePrice ?? null,
    oldPrice: p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.price : null,
    image: p.image,
    gallery: [] as string[],
    shortDescription: p.shortDescription ?? "",
    description: "",
    featured: p.featured ?? false,
    badge: p.badge ?? null,
    type: (p.type?.toLowerCase() ?? "simple") as any,
    stock: p.stock ?? null,
    stockStatus: "unknown" as any,
    priceRange: p.priceRangeMin != null ? { min: p.priceRangeMin, max: p.priceRangeMax ?? p.priceRangeMin } : (p.priceRange ?? null),
  };
}
