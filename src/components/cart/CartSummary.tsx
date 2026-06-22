"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const items = useCartStore((state) => state.items);
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Sažetak košarice</h3>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-slate-600">
          <span>
            Međuzbroj ({items.reduce((s, i) => s + i.quantity, 0)} artikala)
          </span>
          <span className="font-medium text-slate-900">
            {formatPrice(total)}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Dostava</span>
          <span className="font-medium text-slate-900">Po dogovoru</span>
        </div>
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
