"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";
import { couponSchema, formatZodErrors } from "@/lib/validations";

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

const emptyForm = { code:"", type:"PERCENTAGE", value:10, active:true, startsAt:"", endsAt:"", minimumOrderAmount:"" as string|number|null, usageLimit:"" as string|number|null };

export default function AdminCouponsPage() {
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
      const res = await fetch("/api/admin/coupons");
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
      code: item.code || "", type: item.type || "PERCENTAGE", value: item.value ?? 10,
      active: item.active ?? true,
      startsAt: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 16) : "",
      endsAt: item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 16) : "",
      minimumOrderAmount: item.minimumOrderAmount ?? "",
      usageLimit: item.usageLimit ?? "",
    });
    setErrors({});
    setSaveMsg(null);
    setEditId(item.id);
    setMode("edit");
  };

  const cancel = () => {
    setMode("closed");
    setEditId(null);
    setErrors({});
    setSaveMsg(null);
  };

  const save = async () => {
    const parse = couponSchema.safeParse({
      ...f,
      minimumOrderAmount: f.minimumOrderAmount === "" || f.minimumOrderAmount === null ? undefined : Number(f.minimumOrderAmount),
      usageLimit: f.usageLimit === "" || f.usageLimit === null ? undefined : Number(f.usageLimit),
    });
    if (!parse.success) { setErrors(formatZodErrors(parse.error)); return; }
    setErrors({});
    setSaving(true);
    setSaveMsg(null);
    try {
      const method = mode === "create" ? "POST" : "PATCH";
      const url = mode === "create" ? "/api/admin/coupons" : `/api/admin/coupons/${editId}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(parse.data) });
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
      setSaveMsg({ type: "success", text: mode === "create" ? "Kupon dodan." : "Kupon ažuriran." });
      await load();
      setTimeout(() => cancel(), 500);
    } catch { setSaveMsg({ type: "error", text: "Greška pri spremanju." }); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati kupon?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      await load();
    } catch { setSaveMsg({ type: "error", text: "Greška pri brisanju." }); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Kuponi</h2>
        {mode === "closed" && <Button size="sm" onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> Novi kupon</Button>}
      </div>

      {error && <Card className="flex items-center gap-2 border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</Card>}
      {saveMsg && (
        <Card className={`flex items-center gap-2 p-4 text-sm ${saveMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {saveMsg.text}
        </Card>
      )}

      {/* Create / Edit form */}
      {mode !== "closed" && (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-slate-900">{mode === "create" ? "Novi kupon" : "Uredi kupon"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.code ? "border-red-400" : "border-slate-200"}`} placeholder="Kod (npr. TEST10)" value={f.code} onChange={e => { setF({...f,code:e.target.value}); setErrors(prev => ({...prev,code:""})); }} />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
            </div>
            <div>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={f.type} onChange={e => setF({...f,type:e.target.value})}>
                <option value="PERCENTAGE">Postotak (%)</option>
                <option value="FIXED">Fiksni iznos (€)</option>
              </select>
            </div>
            <div>
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.value ? "border-red-400" : "border-slate-200"}`} type="number" placeholder={f.type === "PERCENTAGE" ? "Vrijednost (%)" : "Iznos (€)"} value={f.value} onChange={e => { setF({...f,value:parseFloat(e.target.value)||0}); setErrors(prev => ({...prev,value:""})); }} />
              {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
            </div>
            <div>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Min. iznos narudžbe" value={f.minimumOrderAmount ?? ""} onChange={e => setF({...f,minimumOrderAmount:e.target.value})} />
            </div>
            <div>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Maks. broj korištenja" value={f.usageLimit ?? ""} onChange={e => setF({...f,usageLimit:e.target.value})} />
            </div>
            <div>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="datetime-local" value={f.startsAt} onChange={e => setF({...f,startsAt:e.target.value})} />
            </div>
            <div>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" type="datetime-local" value={f.endsAt} onChange={e => setF({...f,endsAt:e.target.value})} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={e => setF({...f,active:e.target.checked})} /> Aktivno</label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Spremi</Button>
            <Button size="sm" variant="ghost" onClick={cancel}><X className="mr-1 h-4 w-4" /> Odustani</Button>
          </div>
        </Card>
      )}

      {/* List */}
      <Card>
        {loading ? <Skeleton /> : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-400">Nema kupona.</p>
        ) : (
          <div>
            <div className="grid grid-cols-6 gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              <span>Kod</span><span>Tip</span><span>Vrijednost</span><span>Aktivan</span><span>Min. narudžba</span><span className="text-right">Akcije</span>
            </div>
            {items.map(i => (
              <div key={i.id} className={`grid grid-cols-6 gap-3 border-b border-slate-50 px-4 py-3 text-sm ${mode === "edit" && editId === i.id ? "bg-blue-50" : ""}`}>
                <span className="font-medium">{i.code}</span>
                <span>{i.type === "PERCENTAGE" ? `${i.value}%` : `${i.value}€`}</span>
                <span>{i.value}</span>
                <span className={i.active ? "text-emerald-600" : "text-red-500"}>{i.active ? "Da" : "Ne"}</span>
                <span>{i.minimumOrderAmount || "—"}</span>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(i)} disabled={mode === "edit"}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(i.id)} disabled={deleting === i.id}>{deleting === i.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
