"use client";

import { useEffect } from "react";
import { rehydrateCart } from "@/store/cartStore";

export function CartHydrator() {
  useEffect(() => {
    rehydrateCart();
  }, []);

  return null;
}
