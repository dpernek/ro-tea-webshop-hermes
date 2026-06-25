"use client";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Tag, X, Loader2, Truck, ShieldCheck } from "lucide-react";

// ── Constants ──
const VAT_RATE = 0.25; // 25% PDV
const SHIPPING_PRICE = 6.64;
const FREE_SHIPPING_THRESHOLD = 66.36;

// ── Helpers ──
function getItemCount(items: { quantity: number }[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

function pluralArtikala(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "artikl";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "artikla";
  return "artikala";
}

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  shippingOverride?: number | null;
}

export function CartSummary({ showCheckoutButton = true, shippingOverride }: CartSummaryProps) {
  const items = useCartStore(s => s.items);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [activeCoupon, setActiveCoupon] = useState("");

  // ── Calculations ──
  const itemCount = getItemCount(items);
  const subtotalWithVat = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Savings from sale prices
  const totalRegular = items.reduce((s, i) => s + ((i.product as any).regularPrice || i.product.price) * i.quantity, 0);
  const savings = Math.max(0, totalRegular - subtotalWithVat);

  // VAT breakdown
  const subtotalNoVat = subtotalWithVat / (1 + VAT_RATE);
  const vatAmount = subtotalWithVat - subtotalNoVat;

  // Shipping
  const defaultShipping = subtotalWithVat >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  const shipping = shippingOverride !== null && shippingOverride !== undefined ? shippingOverride : defaultShipping;
  const shippingGap = FREE_SHIPPING_THRESHOLD - subtotalWithVat;

  // Total
  const total = subtotalWithVat + shipping - couponDiscount;

  // ── Coupon apply ──
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: subtotalWithVat }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Kupon nije valjan.");
        return;
      }
      setActiveCoupon(data.code || couponCode.trim());
      setCouponDiscount(data.discount || 0);
      setCouponError("");
    } catch {
      setCouponError("Greška pri provjeri kupona.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon("");
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <h3 className="text-lg font-semibold text-slate-900">Sažetak košarice</h3>

      {/* Item count */}
      <p className="mt-1 text-sm text-slate-500">
        Ukupno artikala: {itemCount} {pluralArtikala(itemCount)}
      </p>

      {/* Breakdown */}
      <div className="mt-5 space-y-2.5">
        {/* Subtotal without VAT */}
        <div className="flex justify-between text-sm text-slate-500">
          <span>Međuzbroj bez PDV-a</span>
          <span>{formatPrice(subtotalNoVat)}</span>
        </div>

        {/* VAT */}
        <div className="flex justify-between text-sm text-slate-500">
          <span>PDV (25%)</span>
          <span>{formatPrice(vatAmount)}</span>
        </div>

        {/* Subtotal with VAT */}
        <div className="flex justify-between text-sm text-slate-700">
          <span>Međuzbroj s PDV-om</span>
          <span className="font-medium">{formatPrice(subtotalWithVat)}</span>
        </div>

        {/* Savings */}
        {savings > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Ukupna ušteda</span>
            <span className="font-medium">−{formatPrice(savings)}</span>
          </div>
        )}

        {/* Coupon discount */}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Kupon <span className="font-medium">{activeCoupon}</span></span>
              <button onClick={removeCoupon} className="ml-1 text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
            </div>
            <span className="font-medium">−{formatPrice(couponDiscount)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm text-slate-700">
          <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-slate-400" />Dostava</span>
          <span className="font-medium">
            {shipping === 0 ? "Besplatno" : formatPrice(shipping)}
          </span>
        </div>

        {/* Free shipping progress */}
        {shipping > 0 && subtotalWithVat > 0 && (
          <p className="text-xs text-amber-600">
            Dodajte još {formatPrice(shippingGap)} za besplatnu dostavu
          </p>
        )}
        {shipping === 0 && subtotalWithVat > 0 && (
          <p className="text-xs text-emerald-600">Ostvarili ste besplatnu dostavu</p>
        )}
      </div>

      {/* Coupon input */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        {activeCoupon ? (
          <p className="text-sm text-slate-500">Kupon primijenjen. <button onClick={removeCoupon} className="text-[#0055a8] underline hover:text-blue-800">Ukloni</button></p>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#0055a8] focus:outline-none"
                placeholder="Kod za popust"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value); setCouponError(""); }}
                onKeyDown={e => e.key === "Enter" && applyCoupon()}
              />
              <Button size="sm" variant="outline" onClick={applyCoupon} disabled={couponLoading}>
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Primijeni"}
              </Button>
            </div>
            {couponError && <p className="mt-1.5 text-xs text-red-600">{couponError}</p>}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-lg font-bold text-slate-900">
          <span>Ukupno za platiti</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* CTA */}
      {showCheckoutButton && (
        <Button asChild className="mt-5 w-full" size="lg">
          <Link href="/checkout">Nastavi na blagajnu</Link>
        </Button>
      )}

      {/* Footer info */}
      <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <p className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Cijene su iskazane s PDV-om</p>
        <p>Trošak dostave izračunava se prema odabranom načinu dostave</p>
        <p>Plaćanje karticom, pouzećem ili bankovnom uplatom</p>
      </div>
    </div>
  );
}
