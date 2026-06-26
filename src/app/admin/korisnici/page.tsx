"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Save, X, Lock, Loader2, AlertCircle } from "lucide-react";

interface User { id: string; name: string; email: string; role: string; active: boolean; createdAt: string; }

type Mode = "closed" | "create" | "edit";
const EMPTY = { name: "", email: "", role: "STAFF" as const, password: "", passwordConfirm: "" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("closed");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  // Password change modal
  const [pwUserId, setPwUserId] = useState<string | null>(null);
  const [pw, setPw] = useState({ newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/users");
      if (!r.ok) throw new Error("Ne mogu učitati korisnike.");
      setUsers(await r.json());
    } catch { setError("Greška pri učitavanju korisnika."); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function save() {
    setErrors({}); setSaving(true); setMsg(null);
    try {
      const body: any = { name: form.name, email: form.email, role: form.role };
      if (mode === "create") {
        body.password = form.password; body.passwordConfirm = form.passwordConfirm;
        if (form.password.length < 8) { setErrors({ password: "Lozinka mora imati najmanje 8 znakova." }); return setSaving(false); }
        if (form.password !== form.passwordConfirm) { setErrors({ passwordConfirm: "Potvrda lozinke se ne podudara." }); return setSaving(false); }
      }
      const res = await fetch(mode === "create" ? "/api/admin/users" : `/api/admin/users/${editId}`, {
        method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.errors && typeof d.errors === "object") { setErrors(d.errors); setMsg({ type: "error", text: "Ispravite označena polja." }); }
        else setMsg({ type: "error", text: d.error || "Greška pri spremanju." });
        return;
      }
      setMsg({ type: "success", text: mode === "create" ? "Korisnik uspješno dodan." : "Korisnik ažuriran." });
      setMode("closed"); setForm(EMPTY); load();
    } finally { setSaving(false); }
  }

  async function toggleActive(u: User) {
    const ids = new Set(busyIds); ids.add(u.id); setBusyIds(ids);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) });
      const d = await res.json();
      if (!res.ok) setMsg({ type: "error", text: d.error || "Greška." });
      else load();
    } finally { const ids = new Set(busyIds); ids.delete(u.id); setBusyIds(ids); }
  }

  async function remove(u: User) {
    setMsg(null); const ids = new Set(busyIds); ids.add(u.id); setBusyIds(ids);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg({ type: "error", text: d.error || "Greška pri brisanju." }); return; }
      setDeleteConfirm(null);
      load();
    } finally { const ids = new Set(busyIds); ids.delete(u.id); setBusyIds(ids); }
  }

  async function savePassword() {
    setPwErrors({}); setPwSaving(true); setMsg(null);
    if (!pw.newPassword || pw.newPassword.length < 8) { setPwErrors({ newPassword: "Lozinka mora imati najmanje 8 znakova." }); setPwSaving(false); return; }
    if (pw.newPassword !== pw.confirm) { setPwErrors({ confirm: "Potvrda lozinke se ne podudara." }); setPwSaving(false); return; }
    try {
      const res = await fetch(`/api/admin/users/${pwUserId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: pw.newPassword }) });
      if (!res.ok) { const d = await res.json(); setMsg({ type: "error", text: d.error || "Greška." }); return; }
      setMsg({ type: "success", text: "Lozinka promijenjena." });
      setPwUserId(null); setPw({ newPassword: "", confirm: "" });
    } finally { setPwSaving(false); }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Korisnici</h2>
        {mode === "closed" && <Button onClick={() => { setMode("create"); setForm(EMPTY); setErrors({}); setMsg(null); }}><Plus size={16} className="mr-1.5" />Novi korisnik</Button>}
      </div>

      {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      {(mode === "create" || mode === "edit") && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{mode === "create" ? "Novi korisnik" : "Uredi korisnika"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700">Ime</label><input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e => ({ ...e, name: "" })); }} />{errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}</div>
            <div><label className="text-sm font-medium text-slate-700">E-mail</label><input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(e => ({ ...e, email: "" })); }} />{errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}</div>
            <div><label className="text-sm font-medium text-slate-700">Uloga</label><select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}><option value="ADMIN">Administrator</option><option value="STAFF">Osoblje</option></select></div>
            {mode === "create" && (<>
              <div><label className="text-sm font-medium text-slate-700">Lozinka</label><input type="password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(e => ({ ...e, password: "" })); }} />{errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}</div>
              <div><label className="text-sm font-medium text-slate-700">Potvrdi lozinku</label><input type="password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.passwordConfirm} onChange={e => { setForm(f => ({ ...f, passwordConfirm: e.target.value })); setErrors(e => ({ ...e, passwordConfirm: "" })); }} />{errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>}</div>
            </>)}
          </div>
          <div className="flex gap-3">
            <Button onClick={save} isLoading={saving}><Save size={15} className="mr-1" />Spremi</Button>
            <Button variant="outline" disabled={saving} onClick={() => { setMode("closed"); setErrors({}); setMsg(null); }}><X size={15} className="mr-1" />Odustani</Button>
          </div>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-slate-400" />
          <span className="ml-2 text-slate-400">Učitavanje korisnika...</span>
        </Card>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card className="flex items-center justify-center py-16 text-red-600 gap-2">
          <AlertCircle size={18} /><span>{error}</span>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <span className="text-lg">Nema korisnika</span>
          <span className="text-sm">Dodajte prvog korisnika putem gumba iznad.</span>
        </Card>
      )}

      {/* Data state */}
      {!loading && !error && users.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="px-4 py-3">Ime</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Uloga</th><th className="px-4 py-3">Aktivan</th><th className="px-4 py-3">Kreiran</th><th className="px-4 py-3 text-right">Akcije</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{u.role === "ADMIN" ? "Administrator" : "Osoblje"}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleActive(u)} disabled={busyIds.has(u.id)} className={`inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50 ${u.active ? "text-emerald-600" : "text-red-500"}`}>{u.active ? "✓" : "✕"}{u.active ? "Aktivan" : "Neaktivan"}</button></td>
                  <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString("hr")}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="ghost" disabled={busyIds.has(u.id)} onClick={() => { setMode("edit"); setEditId(u.id); setForm({ name: u.name, email: u.email, role: u.role as any, password: "", passwordConfirm: "" }); setErrors({}); setMsg(null); }}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" disabled={busyIds.has(u.id)} onClick={() => { setPwUserId(u.id); setPw({ newPassword: "", confirm: "" }); setPwErrors({}); }}><Lock size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" disabled={busyIds.has(u.id)} onClick={() => setDeleteConfirm(u.id)}><Trash2 size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Password modal */}
      {pwUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setPwUserId(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Promijeni lozinku</h3>
            <div><label className="text-sm font-medium">Nova lozinka</label><input type="password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} />{pwErrors.newPassword && <p className="text-xs text-red-600 mt-1">{pwErrors.newPassword}</p>}</div>
            <div><label className="text-sm font-medium">Potvrdi lozinku</label><input type="password" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />{pwErrors.confirm && <p className="text-xs text-red-600 mt-1">{pwErrors.confirm}</p>}</div>
            <div className="flex gap-3">
              <Button onClick={savePassword} isLoading={pwSaving}>Spremi</Button>
              <Button variant="outline" disabled={pwSaving} onClick={() => setPwUserId(null)}>Odustani</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Obrisati korisnika?</h3>
            <p className="text-sm text-slate-600">Ova akcija se ne može poništiti. Sigurni ste da želite trajno obrisati ovog korisnika?</p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => remove(users.find(u => u.id === deleteConfirm)!)} isLoading={busyIds.has(deleteConfirm)}>Obriši</Button>
              <Button variant="outline" disabled={busyIds.has(deleteConfirm)} onClick={() => setDeleteConfirm(null)}>Odustani</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
