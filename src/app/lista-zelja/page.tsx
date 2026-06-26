"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const { addItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Heart size={48} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-semibold text-slate-900">Lista želja je prazna</h1>
        <p className="mt-2 text-slate-500">Dodajte proizvode koji vas zanimaju klikom na srce.</p>
        <Link href="/proizvodi" className="mt-6 inline-block rounded-lg bg-[#0055a8] px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Pregledaj proizvode
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Lista želja ({items.length})</h1>
      </div>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
            <Link href={`/proizvodi/${item.slug}`} className="shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-slate-300">?</div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/proizvodi/${item.slug}`} className="font-medium text-slate-900 hover:text-[#0055a8]">{item.name}</Link>
              <p className="text-sm text-slate-500">{formatPrice(item.price)}</p>
            </div>
            <Button size="sm" onClick={() => { addItem({ product: { id: item.id, name: item.name, price: item.price, image: item.image || "", slug: item.slug, stock: null, status: "ACTIVE", sku: "" }, quantity: 1 } as any); }}>
              <ShoppingCart size={14} />
            </Button>
            <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500 p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
