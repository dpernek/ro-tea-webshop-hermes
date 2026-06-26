"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "@/lib/analytics";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.find(i => i.id === item.id)) return;
        set(state => ({ items: [...state.items, item] }));
        trackEvent("add_to_wishlist", { productId: item.id, productName: item.name });
      },
      remove: (id) => {
        const item = get().items.find(i => i.id === id);
        set(state => ({ items: state.items.filter(i => i.id !== id) }));
        if (item) trackEvent("remove_from_wishlist", { productId: item.id, productName: item.name });
      },
      has: (id) => get().items.some(i => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "wishlist" }
  )
);
