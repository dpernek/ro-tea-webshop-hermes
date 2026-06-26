"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Loader2, AlertCircle, FileText } from "lucide-react";

interface AuditEntry {
  id: string; userEmail: string; resource: string; action: string; summary: string; createdAt: string; entityId?: string;
}

const RESOURCES = ["", "products", "categories", "brands", "orders", "users", "coupons", "shipping", "settings", "catalogs"];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const url = filter ? `/api/admin/audit-log?resource=${filter}` : "/api/admin/audit-log";
      const r = await fetch(url);
      if (!r.ok) throw new Error("Ne mogu učitati audit log.");
      setLogs(await r.json());
    } catch { setError("Greška pri učitavanju audit loga."); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Audit log</h2>
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Svi resursi</option>
          {RESOURCES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
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
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(l.createdAt).toLocaleString("hr")}</td>
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
