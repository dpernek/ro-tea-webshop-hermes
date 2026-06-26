"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await addItem(product, quantity);
    trackEvent("add_to_cart", { productId: product.id, productName: product.name, price: product.price, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stockStatus === "outofstock") {
    return (
      <Button disabled className="w-full sm:w-auto">
        Trenutno nedostupno
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity}
        min={1}
        max={product.stock}
      />
      <Button
        onClick={handleAdd}
        size="lg"
        className="w-full sm:w-auto"
        variant={added ? "secondary" : "primary"}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Dodano u košaricu
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Dodaj u košaricu
          </>
        )}
      </Button>
    </div>
  );
}
