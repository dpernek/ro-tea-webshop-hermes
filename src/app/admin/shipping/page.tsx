"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";

type Mode = "closed" | "create" | "edit";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-8 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-5 w-12 rounded-full bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-200" />
            <div className="h-8 w-8 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

const emptyForm = { name: "", price: 0, freeAboveAmount: "" as string|number|null, description: "", sortOrder: 0, active: true };

export default function AdminShippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("closed");
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/shipping");
      if (!res.ok) throw new Error("Greška pri učitavanju.");
      setItems(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setF({ ...emptyForm });
    setErrors({});
    setSaveMsg(null);
    setMode("create");
    setEditId(null);
  };

  const startEdit = (item: any) => {
    setF({
      name: item.name || "", price: item.price ?? 0,
      freeAboveAmount: item.freeAboveAmount ?? "",
      description: item.description || "", sortOrder: item.sortOrder ?? 0,
      active: item.active ?? true,
    });
    setErrors({});
    setSaveMsg(null);
    setEditId(item.id);
    setMode("edit");
  };

  const cancel = () => { setMode("closed"); setEditId(null); setErrors({}); setSaveMsg(null); };

  const clearError = (field: string) => setErrors(prev => ({ ...prev, [field]: "" }));

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!f.name.trim() || f.name.trim().length < 2) errs.name = "Naziv je obavezan (min. 2 znaka).";
    if (f.price < 0) errs.price = "Cijena ne može biti negativna.";
    if (f.price > 10000) errs.price = "Cijena je previsoka.";
    if (f.freeAboveAmount !== "" && f.freeAboveAmount !== null && Number(f.freeAboveAmount) < 0) errs.freeAboveAmount = "Iznos ne može biti negativan.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaveMsg(null);
    try {
      const payload = { ...f, freeAboveAmount: f.freeAboveAmount === "" || f.freeAboveAmount === null ? null : Number(f.freeAboveAmount) };
      const method = mode === "create" ? "POST" : "PATCH";
      const url = mode === "create" ? "/api/admin/shipping" : `/api/admin/shipping/${editId}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.errors && typeof d.errors === "object") {
          setErrors(prev => ({ ...prev, ...d.errors }));
          setSaveMsg({ type: "error", text: "Ispravite označena polja." });
        } else {
          setSaveMsg({ type: "error", text: d.error || "Greška pri spremanju." });
        }
        return;
      }
      setSaveMsg({ type: "success", text: mode === "create" ? "Metoda dodana." : "Metoda ažurirana." });
      await load();
      setTimeout(() => cancel(), 500);
    } catch { setSaveMsg({ type: "error", text: "Greška pri spremanju." }); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati metodu dostave?")) return;
    setDeleting(id);
    try { await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" }); await load(); }
    catch { setSaveMsg({ type: "error", text: "Greška pri brisanju." }); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Dostava</h2>
        {mode === "closed" && <Button size="sm" onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> Nova metoda</Button>}
      </div>

      {error && <Card className="flex items-center gap-2 border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</Card>}
      {saveMsg && (
        <Card className={`flex items-center gap-2 p-4 text-sm ${saveMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {saveMsg.text}
        </Card>
      )}

      {mode !== "closed" && (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-slate-900">{mode === "create" ? "Nova metoda dostave" : "Uredi metodu dostave"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv" value={f.name} onChange={e => { setF({...f,name:e.target.value}); clearError("name"); }} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <input className={`w-24 rounded-lg border px-3 py-2 text-sm ${errors.price ? "border-red-400" : "border-slate-200"}`} type="number" placeholder="Cijena (s PDV-om)" step="0.01" value={f.price} onChange={e => { setF({...f,price:parseFloat(e.target.value)||0}); clearError("price"); }} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <input className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Besplatno iznad (s PDV-om)" type="number" step="0.01" value={typeof f.freeAboveAmount === "number" ? f.freeAboveAmount : f.freeAboveAmount || ""} onChange={e => setF({...f,freeAboveAmount:e.target.value})} />
            {errors.freeAboveAmount && <p className="text-xs text-red-600">{errors.freeAboveAmount}</p>}
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.active} onChange={e => setF({...f,active:e.target.checked})} /> Aktivno</label>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Spremi</Button>
            <Button size="sm" variant="ghost" onClick={cancel}><X className="mr-1 h-4 w-4" /> Odustani</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? <Skeleton /> : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-400">Nema metoda dostave.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className="px-4 py-3 font-medium text-slate-600">Naziv</th><th className="px-4 py-3 font-medium text-slate-600">Cijena (s PDV-om)</th><th className="px-4 py-3 font-medium text-slate-600">Besplatno iznad (s PDV-om)</th><th className="px-4 py-3 font-medium text-slate-600">Aktivno</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(i => (
                <tr key={i.id} className={mode === "edit" && editId === i.id ? "bg-blue-50" : ""}>
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3">{i.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">{i.freeAboveAmount != null ? `${i.freeAboveAmount.toFixed(2)} €` : "—"}</td>
                  <td className="px-4 py-3"><span className={i.active ? "text-emerald-600" : "text-red-500"}>{i.active ? "Da" : "Ne"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(i)} disabled={mode === "edit"}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(i.id)} disabled={deleting === i.id}>{deleting === i.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
