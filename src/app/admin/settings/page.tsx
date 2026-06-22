"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    storeName: "RO-TEA",
    storeEmail: "info@ro-tea.hr",
    storePhone: "+385 1 3820 113",
    storeAddress: "Zagreb, Hrvatska",
    currency: "EUR",
    defaultTaxRate: "25",
    freeShippingThreshold: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFormData({
            storeName: data.storeName || "RO-TEA",
            storeEmail: data.storeEmail || "",
            storePhone: data.storePhone || "",
            storeAddress: data.storeAddress || "",
            currency: data.currency || "EUR",
            defaultTaxRate: String(data.defaultTaxRate || "25"),
            freeShippingThreshold: data.freeShippingThreshold
              ? String(data.freeShippingThreshold)
              : "",
          });
        }
      }
    } catch {
      // Use defaults
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Greška pri spremanju postavki");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Postavke webshopa
      </h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Osnovne postavke
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Naziv trgovine
              </label>
              <input
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="storeEmail"
                value={formData.storeEmail}
                onChange={handleChange}
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Telefon
              </label>
              <input
                name="storePhone"
                value={formData.storePhone}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Adresa
              </label>
              <input
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Valuta
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="EUR">EUR (€)</option>
                <option value="HRK">HRK (kn)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Porez (%)
              </label>
              <input
                name="defaultTaxRate"
                value={formData.defaultTaxRate}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Besplatna dostava iznad (€)
              </label>
              <input
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Npr. 100"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Fiskalizacija (placeholder)
          </h2>
          <p className="text-sm text-slate-500">
            Postavke za fiskalizaciju i račune još nisu implementirane. Ova
            sekcija će sadržavati OIB, podatke za fiskalnu blagajnu i
            konfiguraciju računa.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saved}>
            {saved ? (
              "Spremljeno"
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Spremi postavke
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
