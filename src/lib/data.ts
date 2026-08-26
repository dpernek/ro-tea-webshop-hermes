import { Product, Brand, SiteConfig } from "@/types";
import productsJson from "@/data/products.json";
import brandsJson from "@/data/brands.json";
import siteJson from "@/data/site.json";

export const products: Product[] = (productsJson as Product[]).map((p) => ({
  ...p,
  oldPrice: null, // No hardcoded sale prices from JSON
}));
export const brands: Brand[] = brandsJson as Brand[];
export const site: SiteConfig = siteJson as SiteConfig;
export const siteUrl = site.url;
