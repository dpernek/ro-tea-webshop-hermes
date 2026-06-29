"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    selectedAttributes?: Record<string, string>
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string;
  couponDiscount: number;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

function generateItemId(
  productId: string,
  selectedAttributes?: Record<string, string>
): string {
  if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
    return productId;
  }
  const ordered = Object.entries(selectedAttributes).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  return `${productId}::${JSON.stringify(ordered)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      couponCode: "",
      couponDiscount: 0,

      addItem: (product, quantity = 1, selectedAttributes) => {
        const itemId = generateItemId(product.id, selectedAttributes);
        set((state) => {
          const existing = state.items.find((i) => i.id === itemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { id: itemId, product, quantity, selectedAttributes },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: "", couponDiscount: 0 }),

      setCoupon: (code: string, discount: number) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: "", couponDiscount: 0 }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => {
            const p = item.product;
            const price = p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
            return sum + price * item.quantity;
          },
          0
        );
      },
    }),
    {
      name: "ro-tea-cart-v2",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }) as CartState,
    }
  )
);

export function rehydrateCart() {
  useCartStore.persist.rehydrate();
  useCartStore.setState({ hydrated: true });
}
