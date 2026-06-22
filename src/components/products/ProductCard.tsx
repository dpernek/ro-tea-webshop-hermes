"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const isVariable = product.type === "variable";

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
      <Link
        href={`/proizvodi/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-white"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 [mix-blend-mode:multiply] transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{product.category}</Badge>
          {product.brand && product.brand !== product.category && (
            <Badge variant="outline">{product.brand}</Badge>
          )}
          {product.featured && <Badge variant="accent">Istaknuto</Badge>}
          {product.badge && <Badge variant="accent">{product.badge}</Badge>}
          {isVariable && <Badge variant="info">Više opcija</Badge>}
        </div>

        <h3 className="mb-2">
          <Link
            href={`/proizvodi/${product.slug}`}
            className="hover:text-brand line-clamp-2 text-lg font-semibold text-slate-900"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-slate-500">
          {product.shortDescription}
        </p>

        <div className="mt-auto space-y-4">
          {isVariable && product.priceRange ? (
            <div className="text-lg font-semibold text-slate-900">
              {product.priceRange.min === product.priceRange.max ? (
                <PriceDisplay price={product.priceRange.min} />
              ) : (
                <span>
                  Raspon cijena: {formatPrice(product.priceRange.min)} –{" "}
                  {formatPrice(product.priceRange.max)}
                </span>
              )}
            </div>
          ) : (
            <PriceDisplay price={product.price} oldPrice={product.oldPrice} />
          )}

          {isVariable ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/proizvodi/${product.slug}`}>
                Odaberi opcije
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleAdd}
              className="w-full"
              variant={added ? "secondary" : "primary"}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Dodano
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Dodaj u košaricu
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
