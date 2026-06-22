import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/kategorije/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        {/* Name + count overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-5">
          <h3 className="text-lg font-bold text-white">{category.name}</h3>
          <p className="text-sm text-slate-300">{category.count} proizvoda</p>
        </div>
      </div>
      {/* Bottom */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium text-[#0055a8]">Pregledaj</span>
        <ArrowRight className="h-4 w-4 text-[#0055a8] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
