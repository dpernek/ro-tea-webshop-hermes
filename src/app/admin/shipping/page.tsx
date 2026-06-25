"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";
import { shippingSchema, formatZodErrors } from "@/lib/validations";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-5 w-12 rounded-full bg-slate-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-200" />
            <div className="h-8 w-8 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminShippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", price: 5, freeAboveAmount: "" as string | number | null, description: "", sortOrder: 0, active: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/shipping");
      if (!res.ok) throw new Error("Greška pri učitavanju metoda dostave.");
      setItems(await res.json());
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju metoda dostave.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErrors({});
    setSaveMsg(null);
    const result = shippingSchema.safeParse({ ...f, freeAboveAmount: f.freeAboveAmount === "" ? null : f.freeAboveAmount });
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setSaving(true);
    try {
      const u = editId ? `/api/admin/shipping/${editId}` : "/api/admin/shipping";
      const m = editId ? "PATCH" : "POST";
      const res = await fetch(u, { method: m, body: JSON.stringify(result.data), headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Greška pri spremanju.");
      setSaveMsg({ type: "success", text: editId ? "Metoda dostave ažurirana." : "Metoda dostave dodana." });
      setEditId(null);
      load();
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message || "Greška pri spremanju." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati metodu dostave?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju.");
      load();
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message || "Greška pri brisanju." });
    } finally {
      setDeleting(null);
    }
  };

  const clearError = (field: string) => { if (errors[field]) setErrors({ ...errors, [field]: "" }); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dostava</h1>
        <Button onClick={() => { setEditId(null); setF({ name: "", price: 5, freeAboveAmount: "", description: "", sortOrder: 0, active: true }); setErrors({}); setSaveMsg(null); }}><Plus className="mr-2 h-4 w-4" /> Nova metoda</Button>
      </div>

      {saveMsg && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${saveMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {saveMsg.text}
          <button onClick={() => setSaveMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <input className={`w-full min-w-[180px] rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv *" value={f.name} onChange={e => { setF({...f,name:e.target.value}); clearError("name"); }} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <input className={`w-24 rounded-lg border px-3 py-2 text-sm ${errors.price ? "border-red-400" : "border-slate-200"}`} type="number" placeholder="Cijena (s PDV-om)" step="0.01" value={f.price} onChange={e => { setF({...f,price:parseFloat(e.target.value)||0}); clearError("price"); }} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
            <input className="w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Besplatno iznad (s PDV-om)" type="number" step="0.01" value={typeof f.freeAboveAmount === "number" ? f.freeAboveAmount : f.freeAboveAmount || ""} onChange={e => setF({...f,freeAboveAmount:e.target.value})} />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.active} onChange={e => setF({...f,active:e.target.checked})} /> Aktivno</label>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              {saving ? "Spremanje..." : "Spremi"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setErrors({}); }} disabled={saving}><X className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {error ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <Skeleton />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th><th className="px-4 py-3 font-medium text-slate-600">Cijena (s PDV-om)</th><th className="px-4 py-3 font-medium text-slate-600">Besplatno iznad (s PDV-om)</th><th className="px-4 py-3 font-medium text-slate-600">Aktivno</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{i.name}</td>
                    <td className="px-4 py-3">{i.price?.toFixed(2)} €</td>
                    <td className="px-4 py-3">{i.freeAboveAmount ? `${i.freeAboveAmount} €` : "-"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.active?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>{i.active?"Da":"Ne"}</span></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditId(i.id); setF({ name:i.name, price:i.price, freeAboveAmount:i.freeAboveAmount||"", description:i.description||"", sortOrder:i.sortOrder, active:i.active }); setErrors({}); setSaveMsg(null); }} disabled={deleting === i.id}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(i.id)} disabled={deleting === i.id}>
                        {deleting === i.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
