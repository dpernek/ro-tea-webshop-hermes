"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 rounded bg-slate-200" />
            <div className="h-8 w-8 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/catalogs");
      if (!res.ok) throw new Error("Greška pri učitavanju kataloga.");
      setCatalogs(await res.json());
    } catch (e: any) {
      setError(e.message || "Greška pri učitavanju kataloga.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Obrisati katalog?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/catalogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju kataloga.");
      setSaveMsg({ type: "success", text: "Katalog obrisan." });
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
        <h1 className="text-2xl font-bold text-slate-900">Katalozi</h1>
        <Button asChild>
          <Link href="/admin/katalozi/novi">
            <Plus className="mr-2 h-4 w-4" /> Novi katalog
          </Link>
        </Button>
      </div>

      {saveMsg && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${saveMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {saveMsg.text}
          <button onClick={() => setSaveMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
        </div>
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
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Brend</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Opis</th>
                  <th className="px-4 py-3 font-medium text-slate-600">URL</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalogs.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{cat.brand}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">
                      {cat.description}
                    </td>
                    <td className="max-w-[150px] truncate px-4 py-3 text-xs text-slate-400">
                      {cat.fileUrl}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cat.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {cat.active ? "Aktivno" : "Neaktivno"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild size="sm" variant="ghost" disabled={deleting === cat.id}>
                          <Link href={`/admin/katalozi/${cat.id}/uredi`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => remove(cat.id)}
                          disabled={deleting === cat.id}
                        >
                          {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {catalogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Nema kataloga
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
