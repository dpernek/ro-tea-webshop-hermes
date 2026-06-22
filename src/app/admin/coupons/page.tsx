"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function AdminCouponsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ code:"", type:"PERCENTAGE", value:10, active:true, startsAt:"", endsAt:"", minimumOrderAmount:"", usageLimit:"" });

  const load = async () => { setItems(await (await fetch("/api/admin/coupons")).json()); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const u = editId ? `/api/admin/coupons/${editId}` : "/api/admin/coupons";
    await fetch(u, { method: editId?"PATCH":"POST", body: JSON.stringify(f), headers: {"Content-Type":"application/json"} });
    setEditId(null); load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kuponi</h1>
        <Button onClick={()=>{setEditId(null);setF({code:"",type:"PERCENTAGE",value:10,active:true,startsAt:"",endsAt:"",minimumOrderAmount:"",usageLimit:""});}}><Plus className="mr-2 h-4 w-4" /> Novi kupon</Button>
      </div>
      {editId !== null && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap gap-3">
            <input className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Kod" value={f.code} onChange={e=>setF({...f,code:e.target.value})} />
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="PERCENTAGE">%</option><option value="FIXED">Fiksno</option></select>
            <input className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Vrijednost" value={f.value} onChange={e=>setF({...f,value:parseFloat(e.target.value)||0})} />
            <input className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={f.startsAt} onChange={e=>setF({...f,startsAt:e.target.value})} />
            <input className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm" type="date" value={f.endsAt} onChange={e=>setF({...f,endsAt:e.target.value})} />
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})} /> Aktivno</label>
            <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Spremi</Button>
            <Button size="sm" variant="ghost" onClick={()=>setEditId(null)}><X className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}
      <Card>
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
                  <Button size="sm" variant="ghost" onClick={()=>{setEditId(i.id);setF({code:i.code,type:i.type,value:i.value,active:i.active,startsAt:i.startsAt?new Date(i.startsAt).toISOString().split("T")[0]:"",endsAt:i.endsAt?new Date(i.endsAt).toISOString().split("T")[0]:"",minimumOrderAmount:i.minimumOrderAmount||"",usageLimit:i.usageLimit||""});}}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={async()=>{if(confirm("Obrisati?")){await fetch(`/api/admin/coupons/${i.id}`,{method:"DELETE"});load();}}}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
