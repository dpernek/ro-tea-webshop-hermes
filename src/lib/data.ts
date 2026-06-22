import productsJson from "@/data/products.json";
import categoriesJson from "@/data/categories.json";
import siteJson from "@/data/site.json";
import type { Product, Category, SiteConfig } from "@/types";

export const products = productsJson as unknown as Product[];
export const categories = categoriesJson as unknown as Category[];
export const site = siteJson as unknown as SiteConfig;
