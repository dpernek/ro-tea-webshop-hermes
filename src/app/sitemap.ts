import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = "https://ro-tea-webshop-hermes.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all ACTIVE products (skip archived)
  let products: { slug: string; updatedAt: Date; image: string | null }[] = [];
  try {
    products = await db.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true, image: true },
    });
  } catch (error) {
    console.error("[sitemap] Failed to fetch products:", error);
  }

  // Fetch only ACTIVE categories that have at least one ACTIVE product
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    const catsWithProducts = await db.category.findMany({
      where: {
        status: "ACTIVE",
        products: { some: { status: "ACTIVE" } },
      },
      select: { slug: true, updatedAt: true },
    });
    categories = catsWithProducts;
  } catch (error) {
    console.error("[sitemap] Failed to fetch categories:", error);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/proizvodi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/katalozi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/o-nama`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dostava-i-povrat`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/izjava-o-sigurnosti-online-placanja`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pravila-o-privatnosti`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/uvjeti-kupnje`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pravila-povrata-i-zamjene`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/jednostrani-raskid-ugovora`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Product pages (with per-item error resilience)
  const productPages: MetadataRoute.Sitemap = [];
  for (const product of products) {
    try {
      productPages.push({
        url: `${BASE_URL}/proizvodi/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        ...(product.image ? { images: [product.image] } : {}),
      });
    } catch (error) {
      console.error(`[sitemap] Failed to generate sitemap entry for product slug="${product.slug}":`, error);
    }
  }

  // Category pages (with per-item error resilience)
  const categoryPages: MetadataRoute.Sitemap = [];
  for (const category of categories) {
    try {
      categoryPages.push({
        url: `${BASE_URL}/kategorije/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    } catch (error) {
      console.error(`[sitemap] Failed to generate sitemap entry for category slug="${category.slug}":`, error);
    }
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
