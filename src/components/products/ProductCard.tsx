"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Settings2 } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const isVariable = product.type === "variable";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/proizvodi/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-slate-50"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.badge && (
          <div className="absolute top-4 left-4">
            <Badge variant="accent">{product.badge}</Badge>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
          <span>{product.category}</span>
          {product.brand && (
            <>
              <span>/</span>
              <span>{product.brand}</span>
            </>
          )}
        </div>
        <Link
          href={`/proizvodi/${product.slug}`}
          className="group-hover:text-brand mt-2 text-lg font-semibold text-slate-900"
        >
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {product.shortDescription || product.description.slice(0, 120)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <PriceDisplay
            price={product.price}
            oldPrice={product.oldPrice}
            size="sm"
          />
          {isVariable ? (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <Link href={`/proizvodi/${product.slug}`}>
                <Settings2 className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Opcije</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => addItem(product, 1)}
              className="shrink-0"
              aria-label={`Dodaj ${product.name} u košaricu`}
            >
              <ShoppingCart className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Dodaj</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
