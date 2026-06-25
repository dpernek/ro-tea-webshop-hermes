"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import { CreditCard, Building, Banknote, Package, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const GlsParcelPicker = dynamic(() => import("./GlsParcelPicker"), { ssr: false });

interface FormErrors {
  [key: string]: string;
}

interface GlsDeliveryPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

const SHIPPING_PRICE = 6.64;
const FREE_SHIPPING_THRESHOLD = 66.36;



const PAYMENT_METHODS = [
  { value: "card", label: "Kartica", icon: CreditCard },
  { value: "bank_transfer", label: "Bankovna uplata / predračun", icon: Building },
  { value: "cod", label: "Pouzeće", icon: Banknote },
];

export function CheckoutForm({ onShippingChange }: { onShippingChange?: (price: number) => void }) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    note: "",
    paymentMethod: "bank_transfer",
    shippingMethod: "",
    // GLS Paketomat fields
    glsPickupPointId: "",
    glsPickupPointName: "",
    glsPickupPointAddress: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // GLS delivery points state
  const [glsPoints, setGlsPoints] = useState<GlsDeliveryPoint[]>([]);
  const [glsLoading, setGlsLoading] = useState(false);
  const [glsError, setGlsError] = useState("");
  const [glsFetched, setGlsFetched] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<Array<{id:string;name:string;price:number;freeAboveAmount?:number}>>([]);
  // Dynamic GLS method IDs (detected from fetched shipping methods)
  const glsHomeId = shippingMethods.find(m => m.name.includes("GLS dostava") && !m.name.includes("Paketomat"))?.id || "";
  const glsPaketomatId = shippingMethods.find(m => m.name.includes("GLS Paketomat"))?.id || "";

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingMethod = shippingMethods.find(
    (sm) => sm.id === formData.shippingMethod
  );
  const shippingPrice =
    shippingMethod?.id === "osobno-preuzimanje"
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_PRICE;
  const total = subtotal + shippingPrice;

  // Notify parent when shipping price changes
  // Fetch shipping methods from admin/baze
  useEffect(() => {
    fetch("/api/shipping")
      .then(r => r.json())
      .then(data => {
        const methods = (data || []).filter((m: any) => m.active !== false).map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price || 0,
          freeAboveAmount: m.freeAboveAmount || undefined,
        }));
        setShippingMethods(methods);
        // Auto-detect GLS method IDs
        const glsDostava = methods.find((m: any) => m.name.includes("GLS dostava"));
        const glsPaketomat = methods.find((m: any) => m.name.includes("GLS Paketomat"));
        if (glsDostava) setFormData(prev => ({ ...prev, shippingMethod: glsDostava.id }));
        else if (glsPaketomat) setFormData(prev => ({ ...prev, shippingMethod: glsPaketomat.id }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    onShippingChange?.(shippingPrice);
  }, [shippingPrice, onShippingChange]);

  const fetchDeliveryPoints = useCallback(async () => {
    setGlsLoading(true);
    setGlsError("");
    try {
      const params = new URLSearchParams();
      if (formData.city) params.set("city", formData.city);
      if (formData.postalCode) params.set("postalCode", formData.postalCode);

      const res = await fetch(`/api/shipping/gls/delivery-points?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setGlsPoints(data.points);
      } else {
        setGlsError(data.error || "Greška prilikom dohvaćanja paketomata.");
      }
    } catch (err) {
      setGlsError("Greška prilikom dohvaćanja GLS paketomata. Pokušajte ponovno.");
      console.error("GLS delivery points fetch failed:", err);
    } finally {
      setGlsLoading(false);
      setGlsFetched(true);
    }
  }, [formData.city, formData.postalCode]);

  // Fetch GLS delivery points when "GLS Paketomat" is selected
  // Fetch shipping methods from admin/baze
  useEffect(() => {
    fetch("/api/shipping")
      .then(r => r.json())
      .then(data => {
        const methods = (data || []).filter((m: any) => m.active !== false).map((m: any) => ({
          id: m.id,
          name: m.name,
          price: m.price || 0,
          freeAboveAmount: m.freeAboveAmount || undefined,
        }));
        setShippingMethods(methods);
        // Auto-detect GLS method IDs
        const glsDostava = methods.find((m: any) => m.name.includes("GLS dostava"));
        const glsPaketomat = methods.find((m: any) => m.name.includes("GLS Paketomat"));
        if (glsDostava) setFormData(prev => ({ ...prev, shippingMethod: glsDostava.id }));
        else if (glsPaketomat) setFormData(prev => ({ ...prev, shippingMethod: glsPaketomat.id }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.shippingMethod === glsPaketomatId && !glsFetched) {
      fetchDeliveryPoints();
    }
  }, [formData.shippingMethod, formData.city, formData.postalCode, fetchDeliveryPoints, glsFetched, glsPaketomatId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.length < 3) {
      newErrors.fullName = "Unesite ime i prezime (minimalno 3 znaka).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Unesite valjanu e-mail adresu.";
    }
    if (!formData.phone.trim() || formData.phone.length < 6) {
      newErrors.phone = "Unesite valjani broj telefona.";
    }
    // Address is only required for home delivery, not for paketomat
    if (formData.shippingMethod !== glsPaketomatId) {
      if (!formData.address.trim() || formData.address.length < 5) {
        newErrors.address = "Unesite punu adresu dostave.";
      }
    }
    if (!formData.city.trim()) {
      newErrors.city = "Unesite grad.";
    }
    const postalRegex = /^\d{5}$/;
    if (!formData.postalCode.trim() || !postalRegex.test(formData.postalCode)) {
      newErrors.postalCode = "Unesite valjani poštanski broj (5 znamenaka).";
    }
    // Require pickup point selection for paketomat
    if (formData.shippingMethod === glsPaketomatId && !formData.glsPickupPointId) {
      newErrors.glsPickupPoint = "Odaberite GLS paketomat s karte ili popisa.";
    }
    if (!acceptedTerms) {
      newErrors.terms =
        "Morate prihvatiti uvjete kupnje i politiku privatnosti.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset GLS paketomat selection when switching away from it
      if (name === "shippingMethod" && value !== glsPaketomatId) {
        updated.glsPickupPointId = "";
        updated.glsPickupPointName = "";
        updated.glsPickupPointAddress = "";
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGlsPointSelect = (point: GlsDeliveryPoint) => {
    setFormData((prev) => ({
      ...prev,
      glsPickupPointId: point.id,
      glsPickupPointName: point.name,
      glsPickupPointAddress: `${point.name}, ${point.address}, ${point.postalCode} ${point.city}`,
    }));
    if (errors.glsPickupPoint) {
      setErrors((prev) => ({ ...prev, glsPickupPoint: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Card payment flow: create Stripe checkout session
    if (formData.paymentMethod === "card") {
      setIsCreatingSession(true);
      setStripeError("");
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            note: formData.note,
            items: items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              sku: item.product.sku || undefined,
              quantity: item.quantity,
              unitPrice: item.product.price,
              attributes: item.selectedAttributes,
            })),
            shippingMethodId: formData.shippingMethod,
            paymentMethod: formData.paymentMethod,
            // GLS fields
            glsPickupPointId: formData.glsPickupPointId || undefined,
            glsPickupPointName: formData.glsPickupPointName || undefined,
            glsPickupPointAddress: formData.glsPickupPointAddress || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStripeError(data.error || "Došlo je do greške prilikom kreiranja sesije plaćanja.");
          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (err) {
        setStripeError("Došlo je do greške prilikom kreiranja sesije plaćanja. Pokušajte ponovno.");
        console.error("Stripe checkout session creation failed:", err);
      } finally {
        setIsCreatingSession(false);
      }
      return;
    }

    // Non-card payment flow (bank transfer / COD)
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        note: formData.note,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          sku: item.product.sku || undefined,
          quantity: item.quantity,
          unitPrice: item.product.price,
          attributes: item.selectedAttributes,
        })),
        paymentMethod: formData.paymentMethod,
        shippingMethodId: formData.shippingMethod,
        shippingTotal: shippingPrice,
        subtotal,
        taxTotal: 0,
        total,
        // GLS fields
        glsPickupPointId: formData.glsPickupPointId || undefined,
        glsPickupPointName: formData.glsPickupPointName || undefined,
        glsPickupPointAddress: formData.glsPickupPointAddress || undefined,
      });

      clearCart();
      router.push(`/checkout/uspjeh?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      setErrors({
        form: "Došlo je do greške prilikom slanja narudžbe. Pokušajte ponovno.",
      });
      console.error("Order creation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        Podaci za dostavu
      </h2>

      {errors.form && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {errors.form}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Ime i prezime"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Ivan Horvat"
          required
          aria-required="true"
          autoComplete="name"
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ivan.horvat@email.hr"
          required
          aria-required="true"
          autoComplete="email"
        />
        <Input
          label="Telefon"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+385 91 123 4567"
          required
          aria-required="true"
          autoComplete="tel"
        />
        {formData.shippingMethod !== glsPaketomatId && (
          <div className="sm:col-span-2">
            <Input
              label="Adresa"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Ulica i kućni broj"
              required
              aria-required="true"
              autoComplete="street-address"
            />
          </div>
        )}
        <Input
          label="Grad"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          placeholder="Zagreb"
          required
          aria-required="true"
          autoComplete="address-level2"
        />
        <Input
          label="Poštanski broj"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          error={errors.postalCode}
          placeholder="10000"
          required
          aria-required="true"
          autoComplete="postal-code"
        />
      </div>

      {/* Shipping method */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Način dostave
        </legend>
        <div className="space-y-2">
          {shippingMethods.map((sm) => {
            
            const isSelected = formData.shippingMethod === sm.id;
            return (
              <label
                key={sm.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                  isSelected
                    ? "border-[#0055a8] bg-[#0055a8]/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={sm.id}
                    checked={isSelected}
                    onChange={handleChange}
                    className="text-[#0055a8]"
                    required
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {sm.name}

                  </span>
                </div>
                <span className="text-sm text-slate-600">
                  {shippingPrice === 0 && isSelected
                    ? "Besplatno"
                    : formatPrice(sm.price)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* GLS Paketomat picker */}
      {formData.shippingMethod === glsPaketomatId && (
        <div className="mt-3">
          <GlsParcelPicker
            onSelect={(point) => {
              if (point) {
                setFormData((prev) => ({
                  ...prev,
                  glsPickupPointId: point.id,
                  glsPickupPointName: point.name,
                  glsPickupPointAddress: `${point.name}, ${point.address}`,
                }));
                if (errors.glsPickupPoint) {
                  setErrors((prev) => ({ ...prev, glsPickupPoint: "" }));
                }
              }
            }}
            initialCity={formData.city}
          />
        </div>
      )}

      {/* Selected pickup point indicator */}
      {formData.shippingMethod === glsPaketomatId && formData.glsPickupPointId && (
        <div className="mt-2 rounded-lg bg-[#0055a8]/5 border border-[#0055a8]/20 px-3 py-2 text-sm">
          <span className="text-[#0055a8] font-medium">Odabrani paketomat: </span>
          {formData.glsPickupPointName}
        </div>
      )}

      {/* Terms checkbox */}
      <div>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 text-[#0055a8]"
            required
            aria-required="true"
            aria-invalid={!!errors.terms}
            aria-describedby="terms-error"
          />
          <span className="text-sm text-slate-600">
            Prihvaćam{" "}
            <a href="/uvjeti-kupnje" className="text-[#0055a8] underline hover:text-blue-800">uvjete kupnje</a>
            {" "}i{" "}
            <a href="/pravila-o-privatnosti" className="text-[#0055a8] underline hover:text-blue-800">pravila privatnosti</a>.
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {errors.terms}
          </p>
        )}
      </div>

      {formData.paymentMethod === "bank_transfer" && (
        <p className="text-sm text-slate-500">
          Nakon slanja narudžbe dobit ćete upute za plaćanje na e-mail.
        </p>
      )}
      {formData.paymentMethod === "cod" && (
        <p className="text-sm text-slate-500">
          Plaćanje pouzećem prilikom preuzimanja paketa.
        </p>
      )}
      {formData.paymentMethod === "card" && (
        <p className="text-sm text-slate-500">
          Sigurno plaćanje karticom putem Stripea. Apple Pay i Google Pay se prikazuju ako su dostupni na vašem uređaju.
        </p>
      )}

      {stripeError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {stripeError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={formData.paymentMethod === "card" ? isCreatingSession : isSubmitting}
        disabled={isCreatingSession || isSubmitting}
      >
        Potvrdi narudžbu
      </Button>
    </form>
  );
}
