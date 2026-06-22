"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/payments").then(r => r.json()).then(setPayments); }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Plaćanja ({payments.length})</h1>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="px-4 py-3 font-medium text-slate-600">Iznos</th><th className="px-4 py-3 font-medium text-slate-600">Status</th><th className="px-4 py-3 font-medium text-slate-600">Provider</th><th className="px-4 py-3 font-medium text-slate-600">Datum</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.amount?.toFixed(2)} €</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.provider}/{p.method}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString("hr-HR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
