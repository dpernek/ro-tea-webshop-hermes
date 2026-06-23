"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/types";

interface VariableProductOptionsProps {
  product: Product;
}

export function VariableProductOptions({
  product,
}: VariableProductOptionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const rawAttr = product.attributes;
  const attributes =
    typeof rawAttr === "string"
      ? (() => {
          try { return JSON.parse(rawAttr || "[]"); } catch { return []; }
        })()
      : Array.isArray(rawAttr)
        ? rawAttr
        : [];
  const allSelected =
    attributes.length > 0 && attributes.every((attr) => selected[attr.name]);

  const handleSelect = (name: string, value: string) => {
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!allSelected) return;
    addItem(product, 1, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {product.priceRange &&
        product.priceRange.min !== product.priceRange.max && (
          <div className="text-slate-700">
            Raspon cijena:{" "}
            <span className="font-semibold text-slate-900">
              {formatPrice(product.priceRange.min)} –{" "}
              {formatPrice(product.priceRange.max)}
            </span>
          </div>
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
            Dodaj u košaricu
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
