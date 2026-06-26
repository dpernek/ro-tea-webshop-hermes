"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

interface Section {
  id: string; key: string; title: string; subtitle: string; eyebrow: string;
  ctaLabel: string; ctaHref: string; body: string; active: boolean; sortOrder: number;
}

const SECTIONS = [
  { key: "hero", label: "Hero sekcija" },
  { key: "categories_intro", label: "Kategorije — uvod" },
  { key: "trust", label: "Prednosti kupnje" },
  { key: "cta", label: "CTA sekcija" },
];

export default function AdminContentPage() {
  const [sections, setSections] = useState<Map<string, Section>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Section>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/content");
      if (!r.ok) throw new Error("Ne mogu učitati sadržaj.");
      const data: Section[] = await r.json();
      const map = new Map(data.map(s => [s.key, s]));
      setSections(map);
    } catch { setError("Greška pri učitavanju."); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  function startEdit(s: Section) {
    setActiveKey(s.key);
    setForm({ ...s });
    setErrors({}); setMsg(null);
  }

  async function save() {
    setSaving(true); setErrors({}); setMsg(null);
    try {
      const payload = { key: activeKey, ...form };
      if (!payload.title?.trim()) payload.title = "";
      const r = await fetch("/api/admin/content", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.errors) { setErrors(d.errors); setMsg({ type: "error", text: "Ispravite označena polja." }); }
        else setMsg({ type: "error", text: d.error || "Greška pri spremanju." });
        return;
      }
      setMsg({ type: "success", text: "Sadržaj spremljen." });
      setActiveKey(null);
      load();
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-400" /></div>;
  if (error) return <div className="flex items-center justify-center py-16 text-red-600 gap-2"><AlertCircle size={18} /><span>{error}</span></div>;

  const getSection = (key: string) => sections.get(key);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Sadržaj</h2>
      {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      <div className="grid gap-4">
        {SECTIONS.map(({ key, label }) => {
          const s = getSection(key);
          const isEditing = activeKey === key;
          return (
            <Card key={key} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{label}</h3>
                  <p className="text-xs text-slate-400">{key}</p>
                  {!isEditing && s && <p className="text-sm text-slate-500 mt-1 truncate max-w-md">{s.title || "(bez naslova)"}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {s?.active ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-slate-300" />}
                  <Button size="sm" variant="outline" onClick={() => startEdit(s || { key, title: "", subtitle: "", eyebrow: "", ctaLabel: "", ctaHref: "", body: "", active: true, sortOrder: 0 } as Section)}>Uredi</Button>
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500">Naslov</label>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.title || ""} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(e => ({ ...e, title: "" })); }} />
                      {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Podnaslov</label>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.subtitle || ""} onChange={e => { setForm(f => ({ ...f, subtitle: e.target.value })); setErrors(e => ({ ...e, subtitle: "" })); }} />
                      {errors.subtitle && <p className="text-xs text-red-600 mt-1">{errors.subtitle}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Eyebrow</label>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.eyebrow || ""} onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">CTA label</label>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaLabel || ""} onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">CTA link</label>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaHref || ""} onChange={e => setForm(f => ({ ...f, ctaHref: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" checked={form.active || false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} id={`active-${key}`} />
                      <label htmlFor={`active-${key}`} className="text-xs text-slate-500">Vidljivo</label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tekst</label>
                    <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" rows={3} value={form.body || ""} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={save} isLoading={saving}><Save size={14} className="mr-1" />Spremi</Button>
                    <Button size="sm" variant="outline" onClick={() => setActiveKey(null)}>Odustani</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
