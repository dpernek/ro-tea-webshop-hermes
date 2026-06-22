"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { QuantitySelector } from "./QuantitySelector";
import { Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const attributeLabel = item.selectedAttributes
    ? Object.entries(item.selectedAttributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    : null;

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:gap-6 sm:p-6">
      <Link
        href={`/proizvodi/${item.product.slug}`}
        className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-white sm:w-32"
      >
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-contain p-2 [mix-blend-mode:multiply]"
          sizes="(max-width: 640px) 96px, 128px"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/proizvodi/${item.product.slug}`}
            className="hover:text-brand text-base font-semibold text-slate-900 sm:text-lg"
          >
            {item.product.name}
          </Link>
          {attributeLabel && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {attributeLabel}
            </p>
          )}
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {item.product.shortDescription}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <QuantitySelector
            quantity={item.quantity}
            onChange={(q) => updateQuantity(item.id, q)}
            max={item.product.stock}
            size="sm"
          />
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-slate-900">
              {formatPrice(item.product.price * item.quantity)}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Ukloni artikl"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
