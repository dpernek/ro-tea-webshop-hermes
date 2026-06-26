import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/cleanup-brand-categories
 *
 * Finds categories that are actually brand names (e.g. "Festa", "Pferd", "Metabo")
 * and archives those that have zero products. Does NOT delete product data.
 *
 * Returns a summary of what was archived, skipped, and any errors.
 */
export async function POST() {
  const access = await requireAdmin();
  if (access)
    return access;

  // Known brand names and their common slug patterns
  const brandPatterns = [
    "festa",
    "pferd",
    "metabo",
    "delta-plus",
    "knipex",
    "dormer-pramet",
  ];

  const results = {
    scanned: 0,
    archived: 0,
    skippedHasProducts: 0,
    skippedNotBrandLike: 0,
    errors: [] as string[],
    details: [] as {
      id: string;
      slug: string;
      name: string;
      productCount: number;
      action: "ARCHIVED" | "SKIPPED_HAS_PRODUCTS" | "SKIPPED_NOT_BRAND";
    }[],
  };

  try {
    // 1. Fetch all categories with their product count
    const allCategories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    results.scanned = allCategories.length;

    // 2. For each category, check if it's brand-like
    for (const cat of allCategories) {
      const catNameLower = cat.name.toLowerCase();
      const catSlug = cat.slug;

      // Check if this category name or slug matches any known brand
      const isBrandLike = brandPatterns.some(
        (bp) =>
          catNameLower === bp ||
          catNameLower.includes(bp) ||
          catSlug.includes(bp)
      );

      if (!isBrandLike) {
        results.skippedNotBrandLike++;
        continue;
      }

      // It's brand-like — check if it has products
      if (cat._count.products > 0) {
        results.skippedHasProducts++;
        results.details.push({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          productCount: cat._count.products,
          action: "SKIPPED_HAS_PRODUCTS",
        });
        continue;
      }

      // Empty brand-like category — archive it
      try {
        await db.category.update({
          where: { id: cat.id },
          data: { status: "ARCHIVED" },
        });
        results.archived++;
        results.details.push({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          productCount: 0,
          action: "ARCHIVED",
        });
      } catch (err: any) {
        results.errors.push(
          `Failed to archive category "${cat.slug}": ${err.message}`
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Scanned ${results.scanned} categories. ` +
        `Archived ${results.archived} empty brand-like categories. ` +
        `Skipped ${results.skippedHasProducts} with products, ` +
        `${results.skippedNotBrandLike} not brand-like.`,
      ...results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, ...results },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup-brand-categories
 *
 * Dry-run: shows which categories would be archived without making changes.
 */
export async function GET() {
  const access = await requireAdmin();
  if (access)
    return access;

  const brandPatterns = [
    "festa",
    "pferd",
    "metabo",
    "delta-plus",
    "knipex",
    "dormer-pramet",
  ];

  try {
    const allCategories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    const brandLike = allCategories.filter((cat) =>
      brandPatterns.some(
        (bp) =>
          cat.name.toLowerCase() === bp ||
          cat.name.toLowerCase().includes(bp) ||
          cat.slug.includes(bp)
      )
    );

    const toArchive = brandLike.filter((c) => c._count.products === 0);
    const hasProducts = brandLike.filter((c) => c._count.products > 0);

    const summary = brandLike.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      status: c.status,
      productCount: c._count.products,
      wouldArchive: c._count.products === 0,
    }));

    return NextResponse.json({
      ok: true,
      dryRun: true,
      totalCategories: allCategories.length,
      brandLikeCount: brandLike.length,
      wouldArchiveCount: toArchive.length,
      hasProductsCount: hasProducts.length,
      toArchive: toArchive.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      })),
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
