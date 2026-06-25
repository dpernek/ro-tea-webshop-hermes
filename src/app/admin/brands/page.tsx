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
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-200" /><div className="h-8 w-8 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

const emptyForm = { name: "", description: "" };

export default function AdminBrandsPage() {
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
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/brands");
      if (!res.ok) throw new Error("Greška pri učitavanju.");
      setItems(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setF({ ...emptyForm }); setErrors({}); setSaveMsg(null); setMode("create"); setEditId(null); };
  const startEdit = (item: any) => { setF({ name: item.name||"", description: item.description||"" }); setErrors({}); setSaveMsg(null); setEditId(item.id); setMode("edit"); };
  const cancel = () => { setMode("closed"); setEditId(null); setErrors({}); setSaveMsg(null); };

  const save = async () => {
    const method = mode === "create" ? "POST" : "PATCH";
    const url = mode === "create" ? "/api/admin/brands" : `/api/admin/brands/${editId}`;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (d.errors && typeof d.errors === "object") { setErrors(d.errors); setSaveMsg({ type: "error", text: "Ispravite označena polja." }); }
        else setSaveMsg({ type: "error", text: d.error || "Greška pri spremanju." });
        return;
      }
      setSaveMsg({ type: "success", text: mode === "create" ? "Brend dodan." : "Brend ažuriran." });
      await load();
      setTimeout(() => cancel(), 500);
    } catch { setSaveMsg({ type: "error", text: "Greška pri spremanju." }); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati brend?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveMsg({ type: "error", text: d.error || "Greška pri brisanju." });
        return;
      }
      await load();
      setSaveMsg({ type: "success", text: "Brend obrisan." });
    } catch { setSaveMsg({ type: "error", text: "Greška pri brisanju." }); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Brendovi</h2>
        {mode === "closed" && <Button size="sm" onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> Novi brend</Button>}
      </div>

      {error && <Card className="flex items-center gap-2 border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</Card>}
      {saveMsg && (
        <Card className={`flex items-center gap-2 p-4 text-sm ${saveMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {saveMsg.text}
        </Card>
      )}

      {mode !== "closed" && (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-slate-900">{mode === "create" ? "Novi brend" : "Uredi brend"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv" value={f.name} onChange={e => { setF({...f,name:e.target.value}); setErrors(prev => ({...prev,name:""})); }} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Opis" value={f.description} onChange={e => setF({...f,description:e.target.value})} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Spremi</Button>
            <Button size="sm" variant="ghost" onClick={cancel}><X className="mr-1 h-4 w-4" /> Odustani</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? <Skeleton /> : items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-400">Nema brendova.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className="px-4 py-3 font-medium text-slate-600">Naziv</th><th className="px-4 py-3 font-medium text-slate-600">Opis</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(i => (
                <tr key={i.id} className={mode === "edit" && editId === i.id ? "bg-blue-50" : ""}>
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-slate-500">{i.description || "—"}</td>
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
