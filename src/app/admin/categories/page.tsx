"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { categorySchema, formatZodErrors } from "@/lib/validations";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErrors({});
    const result = categorySchema.safeParse(form);
    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    if (editId) {
      await fetch(`/api/admin/categories/${editId}`, { method: "PATCH", body: JSON.stringify(result.data), headers: { "Content-Type": "application/json" } });
    } else {
      await fetch("/api/admin/categories", { method: "POST", body: JSON.stringify(result.data), headers: { "Content-Type": "application/json" } });
    }
    setEditId(null);
    setForm({ name: "", description: "", sortOrder: 0 });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati kategoriju?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  const startEdit = (c: any) => {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description || "", sortOrder: c.sortOrder || 0 });
    setErrors({});
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kategorije</h1>
        <Button onClick={() => { setEditId(null); setForm({ name: "", description: "", sortOrder: 0 }); setErrors({}); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova kategorija
        </Button>
      </div>

      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <input className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`} placeholder="Naziv *" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <input className={`w-20 rounded-lg border px-3 py-2 text-sm ${errors.sortOrder ? "border-red-400" : "border-slate-200"}`} placeholder="Red." type="number" value={form.sortOrder} onChange={e => { setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 }); if (errors.sortOrder) setErrors({ ...errors, sortOrder: "" }); }} />
                {errors.sortOrder && <p className="mt-1 text-xs text-red-600">{errors.sortOrder}</p>}
              </div>
              <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Spremi</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setErrors({}); }}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">Slug</th>
                <th className="px-4 py-3 font-medium text-slate-600">Red.</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
