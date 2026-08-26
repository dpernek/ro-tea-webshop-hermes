import { Brand, SiteConfig } from "@/types";
import brandsJson from "@/data/brands.json";
import siteJson from "@/data/site.json";

export const brands: Brand[] = brandsJson as Brand[];
export const site: SiteConfig = siteJson as SiteConfig;
export const siteUrl = site.url;
