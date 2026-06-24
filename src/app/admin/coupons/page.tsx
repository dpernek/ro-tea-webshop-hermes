"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";
import { couponSchema, formatZodErrors } from "@/lib/validations";

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

export default function AdminCouponsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ code:"", type:"PERCENTAGE", value:10, active:true, startsAt:"", endsAt:"", minimumOrderAmount:"" as string | number | null, usageLimit:"" as string | number | null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Greška pri učitavanju kupona.");
      setItems(await res.json());
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju kupona.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErrors({});
    setSaveMsg(null);
    const data = {
      ...f,
      minimumOrderAmount: f.minimumOrderAmount === "" ? null : f.minimumOrderAmount,
      usageLimit: f.usageLimit === "" ? null : f.usageLimit,
    };
    const result = couponSchema.safeParse(data);
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setSaving(true);
    try {
      const u = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
      const res = await fetch(u, { method: editId?"PATCH":"POST", body: JSON.stringify(result.data), headers: {"Content-Type":"application/json"} });
      if (!res.ok) throw new Error("Greška pri spremanju kupona.");
      setSaveMsg({ type: "success", text: editId ? "Kupon ažuriran." : "Kupon dodan." });
      setEditId(null);
      load();
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message || "Greška pri spremanju." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati kupon?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-bold text-slate-900">Kuponi</h1>
        <Button onClick={()=>{setEditId(null);setF({code:"",type:"PERCENTAGE",value:10,active:true,startsAt:"",endsAt:"",minimumOrderAmount:"",usageLimit:""});setErrors({});setSaveMsg(null);}}><Plus className="mr-2 h-4 w-4" /> Novi kupon</Button>
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
              <input className={`w-32 rounded-lg border px-3 py-2 text-sm ${errors.code ? "border-red-400" : "border-slate-200"}`} placeholder="Kod *" value={f.code} onChange={e=>{setF({...f,code:e.target.value});clearError("code");}} />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
            </div>
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="PERCENTAGE">%</option><option value="FIXED">Fiksno</option></select>
            <div>
              <input className={`w-24 rounded-lg border px-3 py-2 text-sm ${errors.value ? "border-red-400" : "border-slate-200"}`} type="number" placeholder="Vrijednost" value={f.value} onChange={e=>{setF({...f,value:parseFloat(e.target.value)||0});clearError("value");}} />
              {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value}</p>}
            </div>
            <input className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={f.startsAt} onChange={e=>setF({...f,startsAt:e.target.value})} />
            <input className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={f.endsAt} onChange={e=>setF({...f,endsAt:e.target.value})} />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})} /> Aktivno</label>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              {saving ? "Spremanje..." : "Spremi"}
            </Button>
            <Button size="sm" variant="ghost" onClick={()=>{setEditId(null);setErrors({});}} disabled={saving}><X className="h-4 w-4" /></Button>
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
                <tr><th className="px-4 py-3 font-medium text-slate-600">Kod</th><th className="px-4 py-3 font-medium text-slate-600">Vrsta</th><th className="px-4 py-3 font-medium text-slate-600">Vrijednost</th><th className="px-4 py-3 font-medium text-slate-600">Aktivno</th><th className="px-4 py-3 font-medium text-slate-600">Vrijedi do</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(i=>(
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{i.code}</td>
                    <td className="px-4 py-3">{i.type==="PERCENTAGE"?"%":"€"}</td>
                    <td className="px-4 py-3">{i.value}{i.type==="PERCENTAGE"?"%":"€"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.active?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>{i.active?"Da":"Ne"}</span></td>
                    <td className="px-4 py-3 text-slate-500">{i.endsAt?new Date(i.endsAt).toLocaleDateString("hr-HR"):"-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={()=>{setEditId(i.id);setF({code:i.code,type:i.type,value:i.value,active:i.active,startsAt:i.startsAt?new Date(i.startsAt).toISOString().split("T")[0]:"",endsAt:i.endsAt?new Date(i.endsAt).toISOString().split("T")[0]:"",minimumOrderAmount:i.minimumOrderAmount||"",usageLimit:i.usageLimit||""});setErrors({});setSaveMsg(null);}} disabled={deleting === i.id}><Pencil className="h-4 w-4" /></Button>
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
