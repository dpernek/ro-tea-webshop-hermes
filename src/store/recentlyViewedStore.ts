"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewedItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface RecentlyViewedState {
  items: ViewedItem[];
  add: (item: ViewedItem) => void;
}

const MAX_ITEMS = 6;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const current = get().items.filter(i => i.id !== item.id);
        const updated = [item, ...current].slice(0, MAX_ITEMS);
        set({ items: updated });
      },
    }),
    { name: "recently-viewed" }
  )
);
