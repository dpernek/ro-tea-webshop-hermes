"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface CatalogFormProps {
  catalog?: {
    id: string;
    name: string;
    brand: string;
    description: string;
    fileUrl: string;
    active: boolean;
    sortOrder: number;
  } | null;
}

export function CatalogForm({ catalog }: CatalogFormProps) {
  const router = useRouter();
  const isEdit = !!catalog;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(
      isEdit ? `/api/admin/catalogs/${catalog.id}` : "/api/admin/catalogs",
      {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(Object.fromEntries(fd)),
      }
    );

    if (res.ok) {
      router.push("/admin/katalozi");
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/katalozi">
            <ArrowLeft className="mr-1 h-4 w-4" /> Natrag
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? `Uredi: ${catalog.name}` : "Novi katalog"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <Card className="p-6">
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Naziv *
              </label>
              <input
                name="name"
                defaultValue={catalog?.name || ""}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Brend *
              </label>
              <input
                name="brand"
                defaultValue={catalog?.brand || ""}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Opis
              </label>
              <input
                name="description"
                defaultValue={catalog?.description || ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                URL datoteke (PDF) *
              </label>
              <input
                name="fileUrl"
                defaultValue={catalog?.fileUrl || ""}
                required
                type="url"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={catalog?.active ?? true}
                />
                <span className="text-sm text-slate-700">Aktivan</span>
              </label>
              <div>
                <label className="mb-1 block text-xs text-slate-500">
                  Redoslijed
                </label>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={catalog?.sortOrder || 0}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/katalozi">Odustani</Link>
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? "Spremi" : "Kreiraj"}
          </Button>
        </div>
      </form>
    </div>
  );
}
