"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Loader2, AlertCircle, FileText, X } from "lucide-react";

interface AuditEntry {
  id: string; userEmail: string; resource: string; action: string; summary: string; createdAt: string; entityId?: string;
}

const RESOURCES = ["", "products", "categories", "brands", "orders", "users", "coupons", "shipping", "settings", "catalogs", "content", "stock"];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [resource, setResource] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams();
    if (resource) params.set("resource", resource);
    if (userEmail) params.set("userEmail", userEmail);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    try {
      const r = await fetch(`/api/admin/audit-log?${params.toString()}`);
      if (r.status === 403) { setForbidden(true); setLoading(false); return; }
      if (!r.ok) throw new Error("Ne mogu učitati audit log.");
      setLogs(await r.json());
      setForbidden(false);
    } catch { setError("Greška pri učitavanju audit loga."); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [resource, userEmail, dateFrom, dateTo]);

  const clearFilters = () => { setResource(""); setUserEmail(""); setDateFrom(""); setDateTo(""); };

  if (forbidden) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="flex flex-col items-center gap-3 py-12 px-8 text-center">
          <AlertCircle size={32} className="text-red-400" />
          <p className="text-lg font-semibold text-slate-700">Nemate pristup ovoj stranici</p>
          <p className="text-sm text-slate-400">Ova sekcija je dostupna samo administratorima.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Audit log</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Resurs</label>
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={resource} onChange={e => setResource(e.target.value)}>
            <option value="">Svi</option>
            {RESOURCES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Korisnik (email)</label>
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-48" placeholder="npr. admin@ro-tea.hr" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Od datuma</label>
          <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Do datuma</label>
          <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button onClick={clearFilters} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 flex items-center gap-1"><X size={14} /> Očisti</button>
      </div>

      {loading && (
        <Card className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin" /><span>Učitavanje...</span>
        </Card>
      )}

      {!loading && error && (
        <Card className="flex items-center justify-center py-16 text-red-600 gap-2">
          <AlertCircle size={18} /><span>{error}</span>
        </Card>
      )}

      {!loading && !error && logs.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <FileText size={24} />
          <span className="text-lg">Nema audit zapisa</span>
          <span className="text-sm">Zapisi će se pojaviti nakon izvršenih administratorskih akcija.</span>
        </Card>
      )}

      {!loading && !error && logs.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr><th className="px-4 py-3">Vrijeme</th><th className="px-4 py-3">Korisnik</th><th className="px-4 py-3">Entitet</th><th className="px-4 py-3">Akcija</th><th className="px-4 py-3">Sažetak</th></tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString("hr")}</td>
                  <td className="px-4 py-3 text-slate-500">{l.userEmail}</td>
                  <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">{l.resource}{l.entityId ? ` #${l.entityId.slice(-6)}` : ""}</span></td>
                  <td className="px-4 py-3 font-medium">{l.action}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{l.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
