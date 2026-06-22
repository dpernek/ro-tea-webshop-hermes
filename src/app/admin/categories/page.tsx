"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0 });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) {
      await fetch(`/api/admin/categories/${editId}`, { method: "PATCH", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    } else {
      await fetch("/api/admin/categories", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
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
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kategorije</h1>
        <Button onClick={() => { setEditId(null); setForm({ name: "", description: "", sortOrder: 0 }); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova kategorija
        </Button>
      </div>

      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Naziv" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Red." type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
            <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Spremi</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
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
