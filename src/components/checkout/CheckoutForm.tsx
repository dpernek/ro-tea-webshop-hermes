"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import type { CheckoutFormData } from "@/types";

interface CheckoutFormProps {
  onSuccess: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    // Simulacija slanja narudžbe
    await new Promise((resolve) => setTimeout(resolve, 1200));
    clearCart();
    setIsSubmitting(false);
    onSuccess();
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        Podaci za dostavu
      </h2>
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
        <Input
          label="Adresa *"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Ulica i kućni broj"
        />
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
      <Textarea
        label="Napomena"
        name="note"
        value={formData.note}
        onChange={handleChange}
        placeholder="Dodatne informacije o narudžbi ili dostavi..."
        rows={4}
      />

      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
          <span>Ukupno za platiti</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Plaćanje pouzećem ili prema dogovoru. Nakon slanja kontaktirat ćemo
          vas s potvrdom.
        </p>
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
