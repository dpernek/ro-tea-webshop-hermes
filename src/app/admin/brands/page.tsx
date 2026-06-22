"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button"; import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { brandSchema, formatZodErrors } from "@/lib/validations";

export default function AdminBrandsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => { setItems(await (await fetch("/api/admin/brands")).json()); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setErrors({});
    const result = brandSchema.safeParse(form);
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    if (editId) {
      await fetch(`/api/admin/brands/${editId}`, { method: "PATCH", body: JSON.stringify(result.data), headers: { "Content-Type": "application/json" } });
    } else {
      await fetch("/api/admin/brands", { method: "POST", body: JSON.stringify(result.data), headers: { "Content-Type": "application/json" } });
    }
    setEditId(null); setForm({ name: "", description: "" }); load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Brendovi</h1>
        <Button onClick={() => { setEditId(null); setForm({ name: "", description: "" }); setErrors({}); }}><Plus className="mr-2 h-4 w-4" /> Novi brend</Button>
      </div>
      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv *" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Spremi</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setErrors({}); }}><X className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}
      <Card>
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
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(c.id); setForm({ name: c.name, description: c.description || "" }); setErrors({}); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if (confirm("Obrisati?")) { await fetch(`/api/admin/brands/${c.id}`, { method: "DELETE" }); load(); } }}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
