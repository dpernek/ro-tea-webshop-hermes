import productsJson from "@/data/products.json";
import categoriesJson from "@/data/categories.json";
import brandsJson from "@/data/brands.json";
import siteJson from "@/data/site.json";
import type { Product, Category, Brand, SiteConfig } from "@/types";

export const products = productsJson as unknown as Product[];
export const categories = categoriesJson as unknown as Category[];
export const brands = brandsJson as unknown as Brand[];
export const site = siteJson as unknown as SiteConfig;
