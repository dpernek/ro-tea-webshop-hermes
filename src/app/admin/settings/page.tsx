"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { setSettings(d || {}); setLoading(false); });
  }, []);

  const save = async () => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  };

  if (loading) return <p className="p-8 text-slate-500">Učitavanje...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Postavke</h1>
      <div className="max-w-xl space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Podaci trgovine</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["storeName", "Naziv trgovine"],
              ["storeEmail", "Email"],
              ["storePhone", "Telefon"],
              ["storeAddress", "Adresa"],
              ["currency", "Valuta"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium">{label}</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={settings[key] || ""} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-sm font-medium">Porezna stopa (%)</label>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" value={settings.defaultTaxRate || 25} onChange={e => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Besplatna dostava iznad (€)</label>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" value={settings.freeShippingThreshold || ""} onChange={e => setSettings({ ...settings, freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : null })} />
            </div>
          </div>
        </Card>
        <div className="flex justify-end">
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Spremi postavke</Button>
        </div>
      </div>
    </div>
  );
}
