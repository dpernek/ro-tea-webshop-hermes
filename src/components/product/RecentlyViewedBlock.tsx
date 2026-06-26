"use client";

import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { Eye } from "lucide-react";

export function RecentlyViewedBlock() {
  const items = useRecentlyViewedStore((s) => s.items);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-slate-200 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Nedavno pregledano</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/proizvodi/${item.slug}`}
              className="group flex flex-col items-center rounded-lg border border-slate-100 p-3 text-center hover:shadow-sm transition-shadow"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="mb-2 h-20 w-20 rounded object-contain" />
              ) : (
                <div className="mb-2 flex h-20 w-20 items-center justify-center rounded bg-slate-50 text-slate-300">
                  <Eye size={20} />
                </div>
              )}
              <p className="text-xs font-medium text-slate-700 line-clamp-2">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
