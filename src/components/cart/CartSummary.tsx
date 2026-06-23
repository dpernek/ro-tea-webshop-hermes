"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  shippingOverride?: number | null;
}

const SHIPPING_PRICE = 6.64;
const FREE_SHIPPING_THRESHOLD = 66.36;

export function CartSummary({ showCheckoutButton = true, shippingOverride }: CartSummaryProps) {
  const items = useCartStore((state) => state.items);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const defaultShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_PRICE;
  const shipping = shippingOverride !== null && shippingOverride !== undefined ? shippingOverride : defaultShipping;
  const total = subtotal + shipping;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Sažetak košarice</h3>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-slate-600">
          <span>Međuzbroj ({items.reduce((s, i) => s + i.quantity, 0)} artikala)</span>
          <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Dostava</span>
          <span className="font-medium text-slate-900">
            {shipping === 0 ? "Besplatno" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && shippingOverride === null && subtotal > 0 && (
          <p className="text-xs text-slate-500">
            Još {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} za besplatnu dostavu
          </p>
        )}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex justify-between text-lg font-semibold text-slate-900">
            <span>Ukupno</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      {showCheckoutButton && (
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/checkout">Nastavi na checkout</Link>
        </Button>
      )}
    </div>
  );
}
