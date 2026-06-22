import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  let products: any[] = [];
  let error: string | null = null;

  try {
    products = await db.product.findMany({
      take: 10,
      orderBy: { createdAt: "desc" as any },
      select: { id: true, name: true, slug: true, price: true, status: true, image: true },
    });
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Proizvodi</h1>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="mr-2 h-4 w-4" /> Novi proizvod</Link>
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">Greška: {error}</p>}

      {!error && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Slika</th>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">Cijena</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{p.image ? <img src={p.image} className="h-10 w-10 rounded object-cover" alt="" /> : "-"}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3">{p.price?.toFixed(2)} €</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && products.length === 0 && (
        <p className="p-8 text-center text-slate-500">Nema proizvoda.</p>
      )}
    </div>
  );
}
