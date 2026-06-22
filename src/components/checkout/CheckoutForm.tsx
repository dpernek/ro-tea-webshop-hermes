"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";

interface CheckoutFormProps {
  onSuccess: (orderNumber: string) => void;
}

interface FormErrors {
  [key: string]: string;
}

const SHIPPING_METHODS = [
  {
    id: "dostava-kurirskom-sluzbom",
    name: "Dostava kurirskom službom",
    price: 7.0,
  },
  { id: "osobno-preuzimanje", name: "Osobno preuzimanje", price: 0 },
];

const PAYMENT_METHODS = [
  { value: "card", label: "Kartica" },
  { value: "bank_transfer", label: "Bankovna uplata / predračun" },
  { value: "cod", label: "Pouzeće" },
];

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    note: "",
    paymentMethod: "bank_transfer",
    shippingMethod: "dostava-kurirskom-sluzbom",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingMethod = SHIPPING_METHODS.find(
    (sm) => sm.id === formData.shippingMethod
  );
  const shippingPrice = shippingMethod?.price ?? 0;
  const total = subtotal + shippingPrice;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.length < 3) {
      newErrors.fullName = "Unesite ime i prezime (minimalno 3 znaka).";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Unesite valjanu e-mail adresu.";
    }
    if (!formData.phone.trim() || formData.phone.length < 6) {
      newErrors.phone = "Unesite valjani broj telefona.";
    }
    if (!formData.address.trim() || formData.address.length < 5) {
      newErrors.address = "Unesite punu adresu dostave.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Unesite grad.";
    }
    const postalRegex = /^\d{5}$/;
    if (!formData.postalCode.trim() || !postalRegex.test(formData.postalCode)) {
      newErrors.postalCode = "Unesite valjani poštanski broj (5 znamenaka).";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
      });

      clearCart();
      onSuccess(order.orderNumber);
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
      className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        Podaci za dostavu
      </h2>

      {errors.form && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Ime i prezime *"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Ivan Horvat"
        />
        <Input
          label="E-mail *"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ivan.horvat@email.hr"
        />
        <Input
          label="Telefon *"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+385 91 123 4567"
        />
        <div className="sm:col-span-2">
          <Input
            label="Adresa *"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Ulica i kućni broj"
          />
        </div>
        <Input
          label="Grad *"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          placeholder="Zagreb"
        />
        <Input
          label="Poštanski broj *"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          error={errors.postalCode}
          placeholder="10000"
        />
      </div>

      {/* Shipping method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Način dostave *
        </label>
        <div className="space-y-2">
          {SHIPPING_METHODS.map((sm) => (
            <label
              key={sm.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                formData.shippingMethod === sm.id
                  ? "border-[#0055a8] bg-[#0055a8]/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shippingMethod"
                  value={sm.id}
                  checked={formData.shippingMethod === sm.id}
                  onChange={handleChange}
                  className="text-[#0055a8]"
                />
                <span className="text-sm font-medium text-slate-900">
                  {sm.name}
                </span>
              </div>
              <span className="text-sm text-slate-600">
                {sm.price === 0 ? "Besplatno" : formatPrice(sm.price)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Način plaćanja *
        </label>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((pm) => (
            <label
              key={pm.value}
              className={`flex cursor-pointer items-center rounded-lg border p-3 ${
                formData.paymentMethod === pm.value
                  ? "border-[#0055a8] bg-[#0055a8]/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={pm.value}
                checked={formData.paymentMethod === pm.value}
                onChange={handleChange}
                className="text-[#0055a8]"
              />
              <span className="ml-2 text-sm font-medium text-slate-900">
                {pm.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Textarea
        label="Napomena"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Dodatne informacije o narudžbi ili dostavi..."
        rows={3}
      />

      {/* Terms checkbox */}
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 text-[#0055a8]"
        />
        <span className="text-sm text-slate-600">
          Prihvaćam{" "}
          <a
            href="/uvjeti-kupnje"
            className="text-[#0055a8] underline hover:text-blue-800"
          >
            uvjete kupnje
          </a>{" "}
          i{" "}
          <a
            href="/politika-privatnosti"
            className="text-[#0055a8] underline hover:text-blue-800"
          >
            politiku privatnosti
          </a>
          .
        </span>
      </label>
      {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Ukupno proizvoda</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>Dostava</span>
          <span>
            {shippingPrice === 0 ? "Besplatno" : formatPrice(shippingPrice)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-lg font-semibold text-slate-900">
          <span>Ukupno za platiti</span>
          <span>{formatPrice(total)}</span>
        </div>
        {formData.paymentMethod === "bank_transfer" && (
          <p className="mt-3 text-sm text-slate-500">
            Nakon slanja narudžbe dobit ćete upute za plaćanje na e-mail.
          </p>
        )}
        {formData.paymentMethod === "cod" && (
          <p className="mt-3 text-sm text-slate-500">
            Plaćanje pouzećem prilikom preuzimanja paketa.
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
      >
        Pošalji narudžbu
      </Button>
    </form>
  );
}
