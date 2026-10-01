// Shared with checkout, storefront and statutory price lists.
export function currentProductPrice(product: {
  price: number;
  salePrice?: number | null;
}): number {
  return product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price
    ? product.salePrice
    : product.price;
}

export function regularProductPrice(product: {
  price: number;
  regularPrice?: number | null;
}): number {
  return product.regularPrice != null && product.regularPrice > 0
    ? product.regularPrice
    : product.price;
}
