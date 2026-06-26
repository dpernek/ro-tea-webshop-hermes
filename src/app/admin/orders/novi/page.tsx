"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, Loader2, ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import Link from "next/link";

export default function AdminNewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    address: "", city: "", postalCode: "",
    paymentMethod: "bank_transfer", shippingMethodId: "", note: "",
  });
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number; unitPrice: number; sku?: string }[]>([]);

  useEffect(() => {
    fetch("/api/shipping").then(r => r.json()).then(setShippingMethods).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) { setProducts([]); return; }
    const t = setTimeout(async () => {
      const r = await fetch(`/api/admin/products?search=${encodeURIComponent(searchTerm)}&page=1`);
      const d = await r.json();
      setProducts(d.products || []);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  function addProduct(p: any) {
    if (items.find(i => i.productId === p.id)) return;
    setItems(prev => [...prev, { productId: p.id, productName: p.name, quantity: 1, unitPrice: p.price || p.salePrice || p.regularPrice || 0, sku: p.sku }]);
  }

  function updateQuantity(pid: string, qty: number) {
    setItems(prev => prev.map(i => i.productId === pid ? { ...i, quantity: Math.max(1, qty) } : i));
  }

  function removeItem(pid: string) {
    setItems(prev => prev.filter(i => i.productId !== pid));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const shipMethod = shippingMethods.find(m => m.id === form.shippingMethodId);
  const shippingPrice = shipMethod?.price || 0;
  const isFreeShipping = shipMethod?.freeAboveAmount && subtotal >= shipMethod.freeAboveAmount;
  const effectiveShipping = isFreeShipping ? 0 : shippingPrice;
  const total = subtotal + effectiveShipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErrors({});
    if (items.length === 0) { setErrors({ products: "Dodajte barem jedan proizvod." }); return; }
    if (!form.shippingMethodId) { setErrors({ shippingMethodId: "Odaberite način dostave." }); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };
      const res = await fetch("/api/admin/orders/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.errors) { setErrors(d.errors); setMsg({ type: "error", text: "Ispravite označena polja." }); }
        else setMsg({ type: "error", text: d.error || "Greška pri kreiranju narudžbe." });
        return;
      }
      router.push(`/admin/orders/${d.id}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={18} /></Link>
        <h2 className="text-2xl font-semibold text-slate-900">Nova narudžba</h2>
      </div>

      {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Podaci o kupcu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ime i prezime" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} error={errors.customerName} />
            <Input label="E-mail" type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} error={errors.customerEmail} />
            <Input label="Telefon" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} error={errors.customerPhone} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2"><Input label="Adresa" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} error={errors.address} /></div>
            <Input label="Grad" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} error={errors.city} />
            <Input label="Poštanski broj" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} error={errors.postalCode} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Proizvodi</h3>
          <div className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search size={16} className="text-slate-400" /><input className="flex-1 outline-none text-sm" placeholder="Pretraži proizvode..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
            {products.length > 0 && searchTerm.length >= 2 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                {products.map(p => <button key={p.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50" onClick={() => addProduct(p)}>{p.name} ({p.sku || "—"}) — {p.price?.toFixed(2)} €</button>)}
              </div>
            )}
          </div>
          {errors.products && <p className="text-xs text-red-600">{errors.products}</p>}

          {items.length > 0 && (
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 border-b"><tr><th className="text-left py-2">Proizvod</th><th className="text-center py-2">Kol.</th><th className="text-right py-2">Cijena</th><th className="text-right py-2">Ukupno</th><th></th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.productId} className="border-b border-slate-50">
                    <td className="py-2">{i.productName}</td>
                    <td className="py-2 text-center"><input type="number" min="1" className="w-16 text-center rounded border border-slate-200 px-1 py-0.5 text-sm" value={i.quantity} onChange={e => updateQuantity(i.productId, parseInt(e.target.value) || 1)} /></td>
                    <td className="py-2 text-right">{i.unitPrice.toFixed(2)} €</td>
                    <td className="py-2 text-right font-medium">{(i.quantity * i.unitPrice).toFixed(2)} €</td>
                    <td className="py-2 text-right"><button type="button" className="text-red-400 hover:text-red-600" onClick={() => removeItem(i.productId)}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Dostava i plaćanje</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Način dostave</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.shippingMethodId} onChange={e => setForm(f => ({ ...f, shippingMethodId: e.target.value }))}>
                <option value="">Odaberite...</option>
                {shippingMethods.map(m => <option key={m.id} value={m.id}>{m.name} — {m.price.toFixed(2)} €</option>)}
              </select>
              {errors.shippingMethodId && <p className="text-xs text-red-600 mt-1">{errors.shippingMethodId}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Način plaćanja</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mt-1" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="bank_transfer">Bankovna uplata</option>
                <option value="cod">Pouzeće</option>
                <option value="card">Kartica</option>
              </select>
            </div>
          </div>
          <Input label="Napomena" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm space-y-1">
              <div className="text-slate-500">Međuzbroj: <span className="text-slate-900 font-medium">{subtotal.toFixed(2)} €</span></div>
              <div className="text-slate-500">Dostava: <span className="text-slate-900 font-medium">{isFreeShipping ? "Besplatno" : `${effectiveShipping.toFixed(2)} €`}</span></div>
              <div className="text-lg font-bold text-slate-900">Ukupno: {total.toFixed(2)} EUR</div>
            </div>
            <Button type="submit" isLoading={loading}><Save size={16} className="mr-1.5" />Kreiraj narudžbu</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
