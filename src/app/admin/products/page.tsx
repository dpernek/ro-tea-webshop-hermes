import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Archive, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const search = sp.search || "";
  const categoryId = sp.categoryId || "";
  const brandId = sp.brandId || "";
  const status = sp.status || "";
  const stockStatus = sp.stockStatus || "";
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
  }
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (status) where.status = status;
  if (stockStatus) where.stockStatus = stockStatus;

  const [products, total, categories, brands] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const stockLabels: Record<string, string> = {
    INSTOCK: "Dostupno",
    OUTOFSTOCK: "Nije dostupno",
    ONBACKORDER: "Narudžba",
    UNKNOWN: "Upit",
  };
  const statusLabels: Record<string, string> = {
    ACTIVE: "Aktivno",
    DRAFT: "Skica",
    ARCHIVED: "Arhivirano",
  };

  function filterUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(sp as Record<string, string>);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (updates.page === undefined) params.delete("page");
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Proizvodi ({total})
        </h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novi proizvod
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            placeholder="Pretraži po nazivu ili SKU..."
            defaultValue={search}
            className="min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            name="categoryId"
            defaultValue={categoryId}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Sve kategorije</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="brandId"
            defaultValue={brandId}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Svi brendovi</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Svi statusi</option>
            <option value="ACTIVE">Aktivno</option>
            <option value="DRAFT">Skica</option>
            <option value="ARCHIVED">Arhivirano</option>
          </select>
          <Button type="submit" variant="outline" size="sm">
            Filtriraj
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/products">Očisti</Link>
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Slika</th>
                <th className="px-4 py-3 font-medium text-slate-600">Naziv</th>
                <th className="px-4 py-3 font-medium text-slate-600">SKU</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Kategorija
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Cijena</th>
                <th className="px-4 py-3 font-medium text-slate-600">Zaliha</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg bg-slate-100 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/placeholder.svg";
                      }}
                    />
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="hover:text-[#0055a8]"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {product.sku || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {product.price.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.stockStatus === "INSTOCK"
                          ? "bg-green-100 text-green-700"
                          : product.stockStatus === "OUTOFSTOCK"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {stockLabels[product.stockStatus] || product.stockStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : product.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[product.status] || product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form
                        action={toggleProductStatus.bind(
                          null,
                          product.id,
                          product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"
                        )}
                      >
                        <Button type="submit" size="sm" variant="ghost">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </form>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Nema pronađenih proizvoda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              Stranica {page} od {totalPages} ({total} proizvoda)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={filterUrl({ page: String(page - 1) })}>
                    Prethodna
                  </Link>
                </Button>
              )}
              {page < totalPages && (
                <Button asChild variant="outline" size="sm">
                  <Link href={filterUrl({ page: String(page + 1) })}>
                    Sljedeća
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
