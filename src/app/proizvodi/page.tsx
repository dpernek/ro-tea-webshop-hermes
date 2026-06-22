import type { Metadata } from "next";
import { loadInitialCatalog } from "./actions";
import { CatalogContent } from "@/components/products/CatalogContent";

export const metadata: Metadata = {
  title: "Katalog proizvoda | RO-TEA",
  description:
    "Pregledajte kompletnu ponudu alata i opreme za obradu metala – brusni alati, zaštitna oprema, ručni alat i više.",
  alternates: {
    canonical: "/proizvodi",
  },
  openGraph: {
    title: "Katalog proizvoda | RO-TEA",
    description:
      "Pregledajte kompletnu ponudu alata i opreme za obradu metala – brusni alati, zaštitna oprema, ručni alat i više.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : "";
  const cat = typeof params.cat === "string" ? params.cat : "";
  const brand = typeof params.brand === "string" ? params.brand : "";
  const sort = typeof params.sort === "string" ? params.sort : "name-asc";

  const data = await loadInitialCatalog({
    search: q || undefined,
    categorySlug: cat || undefined,
    brandSlug: brand || undefined,
    sort,
  });

  return (
    <CatalogContent
      key={`${q}|${cat}|${brand}|${sort}`}
      initialProducts={data.products}
      total={data.total}
      categories={data.categories}
      brands={data.brands}
    />
  );
}
