import { Product, Category, Brand, SiteConfig } from "@/types";
import productsJson from "@/data/products.json";
import categoriesJson from "@/data/categories.json";
import brandsJson from "@/data/brands.json";
import siteJson from "@/data/site.json";

export const products: Product[] = (productsJson as Product[]).map((p) => ({
  ...p,
  oldPrice: null, // No hardcoded sale prices from JSON
}));
export const categories: Category[] = categoriesJson as Category[];
export const brands: Brand[] = brandsJson as Brand[];
export const site: SiteConfig = siteJson as SiteConfig;
