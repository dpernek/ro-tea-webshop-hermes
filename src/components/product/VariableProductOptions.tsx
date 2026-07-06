"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/types";

interface VariableProductOptionsProps {
  product: Product & { variants?: { id: string; sku?: string; price: number; attributes: Record<string, string>; stock?: number }[] };
}

function attrKey(attrs: Record<string, string>): string {
  return Object.entries(attrs).sort().map(([k, v]) => `${k}:${v}`).join("|");
}

export function VariableProductOptions({
  product,
}: VariableProductOptionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const rawAttr = product.attributes;
  const attributes: { name: string; options: string[] }[] =
    typeof rawAttr === "string"
      ? (() => {
          try { return JSON.parse(rawAttr || "[]"); } catch { return []; }
        })()
      : Array.isArray(rawAttr)
        ? rawAttr
        : [];

  const allSelected =
    attributes.length > 0 && attributes.every((attr) => selected[attr.name]);

  // Find matching variant for currently selected attributes
  const matchedVariant = useMemo(() => {
    if (!allSelected || !product.variants?.length) return null;
    const selKey = attrKey(selected);
    return product.variants.find((v) => attrKey(v.attributes) === selKey) || null;
  }, [selected, product.variants, allSelected]);

  // Price: matched variant price > selected sale/regular > base
  const displayPrice = useMemo(() => {
    if (matchedVariant) return matchedVariant.price;
    if (allSelected) return product.price;
    // Show price range when nothing selected
    if (product.priceRange && product.priceRange.min !== product.priceRange.max) {
      return null; // null = show range
    }
    return product.price;
  }, [matchedVariant, product.price, product.priceRange, allSelected]);

  const handleSelect = (name: string, value: string) => {
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!allSelected) return;
    const variantPrice = matchedVariant?.price ?? product.price;
    const variantSku = matchedVariant?.sku ?? null;
    // Create a product copy with the correct price for the matched variant
    const pricedProduct = { ...product, price: variantPrice, sku: variantSku || product.sku };
    addItem(pricedProduct, 1, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Price display */}
      {displayPrice !== null ? (
        <div className="text-2xl font-bold text-slate-900">
          {formatPrice(displayPrice)}
        </div>
      ) : product.priceRange && product.priceRange.min !== product.priceRange.max ? (
        <div className="text-slate-700">
          <span className="text-sm">Raspon cijena: </span>
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(product.priceRange.min)} – {formatPrice(product.priceRange.max)}
          </span>
        </div>
      ) : (
        <div className="text-2xl font-bold text-slate-900">
          {formatPrice(product.price)}
        </div>
      )}

      {/* Matched variant info */}
      {matchedVariant && (
        <p className="text-sm text-green-700">
          Cijena za odabranu kombinaciju
          {matchedVariant.sku && <span className="text-slate-400"> · {matchedVariant.sku}</span>}
        </p>
      )}

      {attributes.length > 0 && (
        <div className="space-y-4">
          {attributes.map((attr) => (
            <div key={attr.name}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {attr.name}
              </label>
              <select
                value={selected[attr.name] || ""}
                onChange={(e) => handleSelect(attr.name, e.target.value)}
                className="focus:border-brand focus:ring-brand/20 h-11 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:ring-2 focus:outline-none"
              >
                <option value="">Odaberite {attr.name.toLowerCase()}</option>
                {attr.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleAdd}
        size="lg"
        disabled={!allSelected}
        className="w-full sm:w-auto"
        variant={added ? "secondary" : "primary"}
      >
        {added ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Dodano u košaricu
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            {displayPrice !== null && matchedVariant
              ? `Dodaj u košaricu · ${formatPrice(displayPrice)}`
              : "Dodaj u košaricu"
            }
          </>
        )}
      </Button>

      {attributes.length > 0 && !allSelected && (
        <p className="text-sm text-slate-500">
          Odaberite sve opcije prije dodavanja u košaricu.
        </p>
      )}
    </div>
  );
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("hr-HR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
