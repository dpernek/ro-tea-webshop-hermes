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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-50">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <h3 className="group-hover:text-brand text-lg font-semibold text-slate-900">
        {category.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {category.description}
      </p>
      <div className="text-brand mt-4 flex items-center text-sm font-medium">
        <span>Pregledaj kategoriju</span>
        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
