"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { trackEvent } from "@/lib/analytics";

export function ProductTracker({ product }: { product: { id: string; name: string; price: number; image?: string; slug: string } }) {
  const { add } = useRecentlyViewedStore();

  useEffect(() => {
    add(product);
    trackEvent("view_product", { productId: product.id, productName: product.name, price: product.price });
  }, [product.id]);

  return null;
}
