"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Plus, X, GripVertical, ExternalLink } from "lucide-react";

interface Section {
  id: string; key: string; title: string; subtitle: string; eyebrow: string;
  ctaLabel: string; ctaHref: string; body: string; active: boolean; sortOrder: number;
}

interface TrustItem {
  icon: string;
  title: string;
  description: string;
}

const SECTION_DEFINITIONS = [
  { key: "hero", label: "Hero sekcija", description: "Glavni banner na vrhu početne stranice. Sadrži veliki naslov, podnaslov i CTA gumb.", location: "Vrh početne stranice" },
  { key: "categories_intro", label: "Kategorije — uvod", description: "Kratki uvodni tekst iznad mreže kategorija.", location: "Ispod hero sekcije" },
  { key: "trust", label: "Prednosti kupnje", description: "Lista prednosti / zašto kupiti kod nas. Body polje koristi JSON format za stavke.", location: "Ispod kategorija", isJson: true },
  { key: "cta", label: "CTA sekcija", description: "Poziv na akciju pri dnu početne stranice.", location: "Dno početne stranice" },
];

function parseTrustItems(body: string): TrustItem[] {
  try { const arr = JSON.parse(body); return Array.isArray(arr) ? arr : []; }
  catch { return []; }
}

function formatTrustItems(items: TrustItem[]): string {
  return JSON.stringify(items.filter(i => i.title || i.description), null, 0);
}

export default function AdminContentPage() {
  const [sections, setSections] = useState<Map<string, Section>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Section>>({});
  const [trustItems, setTrustItems] = useState<TrustItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
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
    if (s.key === "trust") setTrustItems(parseTrustItems(s.body || ""));
    setErrors({}); setMsg(null);
  }

  async function save() {
    setSaving(true); setErrors({}); setMsg(null);
    try {
      const def = SECTION_DEFINITIONS.find(d => d.key === activeKey);
      const payload: any = { key: activeKey, ...form };
      if (def?.isJson) payload.body = formatTrustItems(trustItems);
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
      setActiveKey(null); load();
    } finally { setSaving(false); }
  }

  async function toggleActive(key: string, currentActive: boolean) {
    setToggling(key); setMsg(null);
    try {
      const r = await fetch("/api/admin/content", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, active: !currentActive }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setMsg({ type: "error", text: d.error || "Greška pri promjeni statusa." });
        return;
      }
      setMsg({ type: "success", text: `Sekcija ${currentActive ? "sakrivena" : "aktivirana"}.` });
      load();
    } catch {
      setMsg({ type: "error", text: "Greška pri promjeni statusa." });
    } finally { setToggling(null); }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={20} className="animate-spin text-slate-400" /></div>;
  if (error) return <div className="flex items-center justify-center py-16 text-red-600 gap-2"><AlertCircle size={18} /><span>{error}</span></div>;

  const getSection = (key: string) => sections.get(key);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sadržaj</h1>
        <p className="text-sm text-slate-500 mt-1">Upravljanje tekstovima i promotivnim sekcijama početne stranice.</p>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
          msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* Sections grid */}
      <div className="grid gap-5">
        {SECTION_DEFINITIONS.map(def => {
          const s = getSection(def.key);
          const isEditing = activeKey === def.key;
          const isActive = s?.active ?? false;
          const isToggling = toggling === def.key;

          return (
            <Card key={def.key} className={`overflow-hidden transition-shadow ${isEditing ? "shadow-md ring-1 ring-indigo-200" : ""}`}>
              {/* Card header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{def.label}</h3>
                      {/* Active badge */}
                      <button
                        onClick={() => toggleActive(def.key, isActive)}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                        title={isActive ? "Klikni za skrivanje" : "Klikni za aktivaciju"}
                      >
                        {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                        {isToggling ? <Loader2 size={10} className="animate-spin" /> : isActive ? "Aktivno" : "Skriveno"}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{def.key}</p>
                    <p className="text-xs text-slate-500 mt-1.5 max-w-xl">{def.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {def.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a href="/" target="_blank" rel="noopener" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors" title="Otvori početnu stranicu u novom tabu da vidiš ovu sekciju">
                      <ExternalLink size={12} /> Otvori na webu
                    </a>
                    <Button size="sm" variant="outline" onClick={() => startEdit(s || { key: def.key, title: "", subtitle: "", eyebrow: "", ctaLabel: "", ctaHref: "", body: "", active: true, sortOrder: 0 } as Section)}>
                      Uredi
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {!isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    {s ? (
                      <>
                        {s.eyebrow && <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">{s.eyebrow}</p>}
                        {s.title ? <p className="text-sm font-semibold text-slate-800 line-clamp-1">{s.title}</p> : <p className="text-xs text-slate-400 italic">Nema naslova</p>}
                        {s.subtitle ? <p className="text-xs text-slate-500 line-clamp-2">{s.subtitle}</p> : (def.key !== "trust" && <p className="text-xs text-slate-400 italic">Nema podnaslova</p>)}
                        {def.key === "trust" && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {parseTrustItems(s.body || "").slice(0, 4).map((item, i) => (
                              <div key={i} className="text-[11px] text-slate-500">
                                <span className="font-medium text-slate-700">{item.icon} {item.title}</span>
                                {item.description && <span className="block text-[10px] text-slate-400 line-clamp-1">{item.description}</span>}
                              </div>
                            ))}
                            {!s.body && <p className="text-xs text-slate-400 italic col-span-full">Nema stavki prednosti</p>}
                          </div>
                        )}
                        {s.ctaLabel ? (s.ctaHref
                          ? <a href={s.ctaHref} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-1"><ExternalLink size={10} />{s.ctaLabel} → {s.ctaHref}</a>
                          : <p className="text-xs font-medium text-indigo-600 mt-1">Gumb: {s.ctaLabel}</p>)
                          : <p className="text-xs text-slate-400 italic mt-1">Nema CTA gumba</p>}
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sadržaj još nije postavljen. Klikni &quot;Uredi&quot; za postavljanje.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Inline editor */}
              {isEditing && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  {def.key === "trust" ? (
                    <div className="space-y-4">
                      {/* Standard fields for trust section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500">Naslov</label>
                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.title || ""}
                            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(e => ({ ...e, title: "" })); }} />
                          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Podnaslov</label>
                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.subtitle || ""}
                            onChange={e => { setForm(f => ({ ...f, subtitle: e.target.value })); setErrors(e => ({ ...e, subtitle: "" })); }} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Eyebrow</label>
                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.eyebrow || ""}
                            onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <input type="checkbox" checked={form.active || false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} id={`active-${def.key}`} />
                          <label htmlFor={`active-${def.key}`} className="text-xs text-slate-500">Vidljivo</label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500">CTA label</label>
                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaLabel || ""}
                            onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">CTA link</label>
                          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaHref || ""}
                            onChange={e => setForm(f => ({ ...f, ctaHref: e.target.value }))} />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <span className="text-xs font-semibold text-slate-600 uppercase">Stavke prednosti</span>
                        <div className="mt-3 space-y-2">
                          {trustItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3 group">
                              <GripVertical size={14} className="text-slate-300 mt-2 shrink-0 cursor-grab" />
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                <input className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs" placeholder="Ikona (npr. 🚚)" value={item.icon}
                                  onChange={e => { const next = [...trustItems]; next[i] = { ...next[i], icon: e.target.value }; setTrustItems(next); }} />
                                <input className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs" placeholder="Naslov" value={item.title}
                                  onChange={e => { const next = [...trustItems]; next[i] = { ...next[i], title: e.target.value }; setTrustItems(next); }} />
                                <div className="flex gap-1">
                                  <input className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs" placeholder="Opis" value={item.description}
                                    onChange={e => { const next = [...trustItems]; next[i] = { ...next[i], description: e.target.value }; setTrustItems(next); }} />
                                  <button onClick={() => setTrustItems(trustItems.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 shrink-0 self-center" title="Ukloni">
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {trustItems.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">Još nema stavki.</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setTrustItems([...trustItems, { icon: "", title: "", description: "" }])}>
                          <Plus size={12} className="mr-1" />Dodaj stavku
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Standard fields */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Naslov</label>
                        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.title || ""}
                          onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(e => ({ ...e, title: "" })); }} />
                        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Podnaslov</label>
                        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.subtitle || ""}
                          onChange={e => { setForm(f => ({ ...f, subtitle: e.target.value })); setErrors(e => ({ ...e, subtitle: "" })); }} />
                        {errors.subtitle && <p className="text-xs text-red-600 mt-1">{errors.subtitle}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Eyebrow</label>
                        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.eyebrow || ""}
                          onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">CTA label</label>
                        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaLabel || ""}
                          onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">CTA link</label>
                        <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.ctaHref || ""}
                          onChange={e => setForm(f => ({ ...f, ctaHref: e.target.value }))} />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input type="checkbox" checked={form.active || false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} id={`active-${def.key}`} />
                        <label htmlFor={`active-${def.key}`} className="text-xs text-slate-500">Vidljivo</label>
                      </div>
                    </div>
                  )}

                  {def.key !== "trust" && (
                    <div>
                      <label className="text-xs font-medium text-slate-500">Tekst</label>
                      <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" rows={3} value={form.body || ""}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
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
