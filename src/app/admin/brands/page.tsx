"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button"; import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";
import { brandSchema, formatZodErrors } from "@/lib/validations";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-200" />
            <div className="h-8 w-8 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminBrandsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/brands");
      if (!res.ok) throw new Error("Greška pri učitavanju brendova.");
      setItems(await res.json());
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju brendova.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErrors({});
    setSaveMsg(null);
    const result = brandSchema.safeParse(form);
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setSaving(true);
    try {
      const res = editId
        ? await fetch(`/api/admin/brands/${editId}`, {
            method: "PATCH",
            body: JSON.stringify(result.data),
            headers: { "Content-Type": "application/json" },
          })
        : await fetch("/api/admin/brands", {
            method: "POST",
            body: JSON.stringify(result.data),
            headers: { "Content-Type": "application/json" },
          });

      if (!res.ok) throw new Error("Greška pri spremanju brenda.");
      setSaveMsg({ type: "success", text: editId ? "Brend ažuriran." : "Brend dodan." });
      setEditId(null);
      setForm({ name: "", description: "" });
      load();
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message || "Greška pri spremanju." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati brend?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju.");
      load();
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message || "Greška pri brisanju." });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Brendovi</h1>
        <Button onClick={() => { setEditId(null); setForm({ name: "", description: "" }); setErrors({}); setSaveMsg(null); }}>
          <Plus className="mr-2 h-4 w-4" /> Novi brend
        </Button>
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
          <div className="flex gap-3">
            <div className="flex-1">
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv *" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
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
                <tr><th className="px-4 py-3 font-medium text-slate-600">Naziv</th><th className="px-4 py-3 font-medium text-slate-600">Slug</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => { setEditId(c.id); setForm({ name: c.name, description: c.description || "" }); setErrors({}); setSaveMsg(null); }} disabled={deleting === c.id}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(c.id)} disabled={deleting === c.id}>
                        {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
