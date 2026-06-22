import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = "https://ro-tea-webshop-hermes.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all ACTIVE products
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true, image: true },
  });

  // Fetch all ACTIVE categories
  const categories = await db.category.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

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
  ];

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/proizvodi/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
    ...(product.image ? { images: [product.image] } : {}),
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/kategorije/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
