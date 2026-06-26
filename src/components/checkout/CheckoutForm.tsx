"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { CreditCard, Building, Banknote } from "lucide-react";

const GlsParcelPicker = dynamic(() => import("./GlsParcelPicker"), { ssr: false });

interface FormErrors { [key: string]: string; }

export function CheckoutForm({ onShippingChange }: { onShippingChange?: (price: number, freeAbove?: number | null, methodName?: string) => void }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", city: "", postalCode: "",
    note: "", paymentMethod: "bank_transfer", shippingMethod: "",
    glsPickupPointId: "", glsPickupPointName: "", glsPickupPointAddress: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [shippingMethods, setShippingMethods] = useState<Array<{ id: string; name: string; price: number; freeAboveAmount?: number | null }>>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    fetch("/api/shipping")
      .then(r => r.json())
      .then(data => {
        setShippingMethods((data || []).map((m: any) => ({
          id: m.id, name: m.name, price: m.price || 0,
          freeAboveAmount: m.freeAboveAmount ?? null,
        })));
      })
      .catch(() => setShippingError("Nije moguće učitati načine dostave."))
      .finally(() => setShippingLoading(false));
  }, []);

  const GLS_HOME = "GLS dostava";
  const GLS_PAKETOMAT = "GLS Paketomat";

  const currentMethod = shippingMethods.find(m => m.id === formData.shippingMethod);
  const currentName = currentMethod?.name || "";
  const isGlsHome = currentName === GLS_HOME;
  const isGlsPaketomat = currentName === GLS_PAKETOMAT;
  const glsPaketomatId = shippingMethods.find(m => m.name === GLS_PAKETOMAT)?.id || "";

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const methodPrice = currentMethod?.price ?? 0;
  const freeAbove = currentMethod?.freeAboveAmount ?? null;
  const isFreeShipping = freeAbove !== null && subtotal >= freeAbove;
  const shippingPrice = isFreeShipping ? 0 : methodPrice;
  const total = subtotal + shippingPrice - couponDiscount;

  useEffect(() => { onShippingChange?.(shippingPrice, freeAbove, currentMethod?.name); }, [shippingPrice, freeAbove, currentMethod?.name, onShippingChange]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.fullName.trim() || formData.fullName.length < 3) e.fullName = "Unesite ime i prezime.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Unesite ispravnu e-mail adresu.";
    if (!formData.phone.trim() || formData.phone.length < 6) e.phone = "Unesite broj telefona.";
    if (!formData.address.trim() || formData.address.length < 3) e.address = "Unesite ulicu i kućni broj.";
    if (!formData.city.trim()) e.city = "Unesite grad.";
    if (!/^\d{5}$/.test(formData.postalCode)) e.postalCode = "Unesite poštanski broj (5 znamenaka).";
    if (isGlsPaketomat && !formData.glsPickupPointId) e.glsPickupPoint = "Odaberite paketomat za preuzimanje.";
    if (!formData.shippingMethod) e.shippingMethod = "Odaberite način dostave.";
    if (!acceptedTerms) e.terms = "Prihvatite uvjete kupnje.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const u = { ...prev, [name]: value };
      if (name === "shippingMethod" && value !== glsPaketomatId) {
        u.glsPickupPointId = ""; u.glsPickupPointName = ""; u.glsPickupPointAddress = "";
      }
      return u;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.paymentMethod === "card") {
      setIsCreatingSession(true);
      setStripeError("");
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.fullName, customerEmail: formData.email,
            customerPhone: formData.phone, address: formData.address,
            city: formData.city, postalCode: formData.postalCode, note: formData.note,
            items: items.map(i => ({ productId: i.product.id, productName: i.product.name, sku: i.product.sku ?? undefined, quantity: i.quantity, unitPrice: i.product.price })),
            shippingMethodId: formData.shippingMethod, paymentMethod: formData.paymentMethod,
            glsPickupPointId: formData.glsPickupPointId || undefined,
            glsPickupPointName: formData.glsPickupPointName || undefined,
            glsPickupPointAddress: formData.glsPickupPointAddress || undefined,
        couponCode: couponCode || undefined,
            couponCode: couponCode || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setStripeError(data.error || "Plaćanje trenutno nije dostupno."); return; }
        window.location.href = data.url;
      } catch { setStripeError("Greška pri plaćanju. Pokušajte ponovno."); }
      finally { setIsCreatingSession(false); }
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerName: formData.fullName, customerEmail: formData.email,
        customerPhone: formData.phone, address: formData.address,
        city: formData.city, postalCode: formData.postalCode, note: formData.note,
        items: items.map(i => ({ productId: i.product.id, productName: i.product.name, sku: i.product.sku ?? undefined, quantity: i.quantity, unitPrice: i.product.price })),
        paymentMethod: formData.paymentMethod, shippingMethodId: formData.shippingMethod,
        shippingTotal: shippingPrice, subtotal, taxTotal: 0, total,
        glsPickupPointId: formData.glsPickupPointId || undefined,
        glsPickupPointName: formData.glsPickupPointName || undefined,
        glsPickupPointAddress: formData.glsPickupPointAddress || undefined,
        couponCode: couponCode || undefined,
      });
      clearCart();
      router.push(`/checkout/uspjeh?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch {
      setErrors({ form: "Greška pri slanju narudžbe. Pokušajte ponovno." });
    } finally { setIsSubmitting(false); }
  };

  if (items.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-7">
      <h2 className="text-xl font-semibold text-slate-900">Podaci za narudžbu</h2>

      {errors.form && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{errors.form}</div>}
      {stripeError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{stripeError}</div>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Ime i prezime" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} placeholder="Ivan Horvat" required />
        <Input label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="ivan.horvat@email.hr" required />
        <Input label="Telefon" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="+385 91 123 4567" required />
        <div className="sm:col-span-2">
          <Input label="Adresa (ulica i kućni broj)" name="address" value={formData.address} onChange={handleChange} error={errors.address} placeholder="Ulica i kućni broj" required />
        </div>
        <Input label="Grad" name="city" value={formData.city} onChange={handleChange} error={errors.city} placeholder="Zagreb" required />
        <Input label="Poštanski broj" name="postalCode" value={formData.postalCode} onChange={handleChange} error={errors.postalCode} placeholder="10000" required />
      </div>

      {shippingLoading && <p className="text-sm text-slate-400">Učitavanje načina dostave...</p>}
      {shippingError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{shippingError}</div>}
      {!shippingLoading && !shippingError && <>
      {/* Shipping */}
      {errors.shippingMethod && <p className="text-xs text-red-600 -mt-2 mb-2">{errors.shippingMethod}</p>}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Način dostave</p>
        <div className="space-y-2">
          {shippingMethods.map(sm => {
            const sel = formData.shippingMethod === sm.id;
            return (
              <label key={sm.id} className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${sel ? "border-[#0055a8] bg-[#0055a8]/5" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center gap-2.5">
                  <input type="radio" name="shippingMethod" value={sm.id} checked={sel} onChange={handleChange} className="text-[#0055a8]" required />
                  <span className="text-sm font-medium text-slate-900">
                    {sm.name}
                    {(sm.name === GLS_HOME || sm.name === GLS_PAKETOMAT) && (
                      <NextImage src="/images/shipping/gls-icon.png" alt="GLS" width={47} height={16} className="ml-1.5 inline-block align-middle opacity-90" />
                    )}
                  </span>
                </div>
                <span className="text-sm text-slate-500">{formatPrice(sm.price)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* GLS home */}
      {isGlsHome && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm text-slate-600">
          Dostava kurirskom službom GLS na vašu adresu. Isporuka sljedeći radni dan.
        </div>
      )}

      {/* GLS Paketomat */}
      {isGlsPaketomat && (
        <GlsParcelPicker
          onSelect={(point) => {
            if (point) {
              setFormData(prev => ({
                ...prev,
                glsPickupPointId: point.id,
                glsPickupPointName: point.name,
                glsPickupPointAddress: `${point.contact.address}, ${point.contact.postalCode} ${point.contact.city}`,
              }));
              setErrors(prev => ({ ...prev, glsPickupPoint: "" }));
            }
          }}
          selectedName={formData.glsPickupPointName}
          selectedAddress={formData.glsPickupPointAddress}
          city={formData.city}
          postalCode={formData.postalCode}
          customerAddress={formData.address}
        />
      )}

      </>}
      {/* Payment */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Način plaćanja</p>
        <div className="space-y-2">
          {[
            { value: "card", label: "Karticom", icon: CreditCard, hint: "Plaćanje karticom — brzo i sigurno." },
            { value: "bank_transfer", label: "Bankovna uplata / predračun", icon: Building, hint: "Nakon narudžbe šaljemo vam račun za uplatu na e-mail." },
            { value: "cod", label: "Pouzeće", icon: Banknote, hint: "Plaćanje pouzećem prilikom preuzimanja pošiljke." },
          ].map(pm => {
            const sel = formData.paymentMethod === pm.value;
            const Icon = pm.icon;
            return (
              <label key={pm.value} className={`block cursor-pointer rounded-lg border p-3 transition-colors ${sel ? "border-[#0055a8] bg-[#0055a8]/5" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center gap-2.5">
                  <input type="radio" name="paymentMethod" value={pm.value} checked={sel} onChange={handleChange} className="text-[#0055a8]" required />
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">{pm.label}</span>
                </div>
                {sel && <p className="mt-1.5 pl-7 text-xs text-slate-500">{pm.hint}</p>}
              </label>
            );
          })}
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5 text-[#0055a8]" required />
          <span className="text-sm text-slate-600">
            Prihvaćam{" "}<a href="/uvjeti-kupnje" className="text-[#0055a8] underline underline-offset-2 hover:text-blue-800">uvjete kupnje</a>,{" "}<a href="/pravila-o-privatnosti" className="text-[#0055a8] underline underline-offset-2 hover:text-blue-800">pravila privatnosti</a>,{" "}<a href="/povrat-i-zamjena" className="text-[#0055a8] underline underline-offset-2 hover:text-blue-800">uvjete povrata</a>,{" "}<a href="/raskid-ugovora" className="text-[#0055a8] underline underline-offset-2 hover:text-blue-800">jednostrani raskid</a>{" "}i{" "}<a href="/sigurnost-online-placanja" className="text-[#0055a8] underline underline-offset-2 hover:text-blue-800">sigurnost plaćanja</a>.
          </span>
        </label>
        {errors.terms && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.terms}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting || isCreatingSession || shippingLoading} disabled={isSubmitting || isCreatingSession || shippingLoading || !!shippingError}>
        {isCreatingSession ? "Preusmjeravanje na plaćanje…" : "Potvrdi narudžbu"}
      </Button>
    </form>
  );
}
