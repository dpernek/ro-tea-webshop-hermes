"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/customers")
      .then(r => {
        if (!r.ok) throw new Error("Greška pri učitavanju kupaca.");
        return r.json();
      })
      .then(setCustomers)
      .catch(e => setError(e.message || "Greška pri učitavanju kupaca."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Kupci ({loading ? "..." : customers.length})</h1>
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
                <tr><th className="px-4 py-3 font-medium text-slate-600">Ime</th><th className="px-4 py-3 font-medium text-slate-600">Email</th><th className="px-4 py-3 font-medium text-slate-600">Telefon</th><th className="px-4 py-3 font-medium text-slate-600">Datum</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.email || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString("hr-HR")}</td>
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
