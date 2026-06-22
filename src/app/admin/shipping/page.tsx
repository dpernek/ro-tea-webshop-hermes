"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function AdminShippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", price: 5, freeAboveAmount: "", description: "", sortOrder: 0, active: true });

  const load = async () => { setItems(await (await fetch("/api/admin/shipping")).json()); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const u = editId ? `/api/admin/shipping/${editId}` : "/api/admin/shipping";
    const m = editId ? "PATCH" : "POST";
    await fetch(u, { method: m, body: JSON.stringify(f), headers: { "Content-Type": "application/json" } });
    setEditId(null); load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dostava</h1>
        <Button onClick={() => { setEditId(null); setF({ name: "", price: 5, freeAboveAmount: "", description: "", sortOrder: 0, active: true }); }}><Plus className="mr-2 h-4 w-4" /> Nova metoda</Button>
      </div>
      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-3">
            <input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Naziv" value={f.name} onChange={e => setF({...f,name:e.target.value})} />
            <input className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Cijena" value={f.price} onChange={e => setF({...f,price:parseFloat(e.target.value)||0})} />
            <input className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Besplatno iznad" value={f.freeAboveAmount} onChange={e => setF({...f,freeAboveAmount:e.target.value})} />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.active} onChange={e => setF({...f,active:e.target.checked})} /> Aktivno</label>
            <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Spremi</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="px-4 py-3 font-medium text-slate-600">Naziv</th><th className="px-4 py-3 font-medium text-slate-600">Cijena</th><th className="px-4 py-3 font-medium text-slate-600">Besplatno iznad</th><th className="px-4 py-3 font-medium text-slate-600">Aktivno</th><th className="px-4 py-3 text-right font-medium text-slate-600">Akcije</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(i => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{i.name}</td>
                <td className="px-4 py-3">{i.price?.toFixed(2)} €</td>
                <td className="px-4 py-3">{i.freeAboveAmount ? `${i.freeAboveAmount} €` : "-"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.active?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>{i.active?"Da":"Ne"}</span></td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(i.id); setF({ name:i.name, price:i.price, freeAboveAmount:i.freeAboveAmount||"", description:i.description||"", sortOrder:i.sortOrder, active:i.active }); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => { if(confirm("Obrisati?")){ await fetch(`/api/admin/shipping/${i.id}`,{method:"DELETE"}); load(); } }}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
