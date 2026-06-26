"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { setSettings(d || {}); setLoading(false); })
      .catch(() => { setFeedback({ type: "error", msg: "Greška pri učitavanju postavki." }); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.errors && typeof d.errors === "object") {
          const msg = Object.entries(d.errors).map(([k,v]) => `${k}: ${v}`).join("; ");
          setFeedback({ type: "error", msg: msg || "Ispravite označena polja." });
        } else {
          setFeedback({ type: "error", msg: d.error || "Greška pri spremanju." });
        }
        setSaving(false);
        return;
      }
      setFeedback({ type: "success", msg: "Postavke spremljene." });
    } catch {
      setFeedback({ type: "error", msg: "Greška pri spremanju postavki." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8 text-slate-500">Učitavanje...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Postavke</h1>
      <div className="max-w-xl space-y-6">
        {feedback && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${feedback.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {feedback.msg}
          </div>
        )}
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
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Spremanje..." : "Spremi postavke"}
          </Button>
        </div>
      </div>
    </div>
  );
}
