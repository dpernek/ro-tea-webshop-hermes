import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/client";
import { z } from "zod";
import {
  buildPriceList,
  catalogFingerprint,
  catalogItems,
  catalogSelect,
  confirmationSchema,
  fileTimestamp,
  reviewTemplate,
  validateConfirmation,
  zagrebDate,
} from "./catalog";
import { applyConfirmation } from "./apply-confirmation";

export class ComplianceError extends Error {
  constructor(
    public details: string[],
    public status = 422
  ) {
    super(details.join("\n"));
  }
}

export async function complianceReview() {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { id: "asc" },
    select: catalogSelect,
  });
  const [settings, runs, snapshots] = await Promise.all([
    db.priceListSettings.findUnique({ where: { id: "webshop" } }),
    db.priceListRun.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    db.priceListSnapshot.findMany({
      orderBy: { publishedAt: "desc" },
      take: 31,
      select: {
        filename: true,
        localDate: true,
        checksum: true,
        rowCount: true,
        publishedAt: true,
      },
    }),
  ]);
  return {
    template: reviewTemplate(products),
    errors: buildPriceList(products).errors,
    settings: settings ?? { address: "", objectCode: "WEB-01", enabled: false },
    runs,
    snapshots,
  };
}

export async function confirmAnchors(
  input: unknown,
  actor: string,
  preview: boolean
) {
  const parsed = confirmationSchema.safeParse(input);
  if (!parsed.success)
    throw new ComplianceError(
      parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      )
    );
  const data = parsed.data;
  return db.$transaction(
    async (tx) => {
      const products = await tx.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { id: "asc" },
        select: catalogSelect,
      });
      if (catalogFingerprint(products) !== data.fingerprint)
        throw new ComplianceError(
          [
            "Katalog se promijenio. Preuzmite novi predložak i ponovite pregled.",
          ],
          409
        );
      const errors = validateConfirmation(products, data.rows);
      if (errors.length) throw new ComplianceError(errors);
      const items = new Map(
        catalogItems(products).map((item) => [item.itemKey, item])
      );
      if (preview)
        return {
          preview: true,
          rowCount: data.rows.length,
          newAnchors: data.rows.filter(
            (row) =>
              !(
                items.get(row.itemKey)!.variant ??
                items.get(row.itemKey)!.product
              ).anchorConfirmedAt
          ).length,
        };
      const now = new Date();
      await applyConfirmation(tx, data.rows);
      const audit = data.rows.map((row) => {
        const { product, variant } = items.get(row.itemKey)!;
        const item = variant ?? product;
        return {
          itemKey: row.itemKey,
          before: JSON.stringify({
            ...item,
            variants: undefined,
            productId: product.id,
            name: product.name,
            regularPrice: product.regularPrice,
            salePrice: product.salePrice,
          }),
          after: JSON.stringify(row),
          reason: data.source,
          actor,
        };
      });
      for (let start = 0; start < audit.length; start += 500)
        await tx.priceAnchorAudit.createMany({
          data: audit.slice(start, start + 500),
        });
      return {
        preview: false,
        rowCount: data.rows.length,
        confirmedAt: now.toISOString(),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 60000,
    }
  );
}

export const settingsSchema = z.object({
  address: z.string().trim().min(3).max(200),
  objectCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{1,30}$/),
  enabled: z.boolean(),
});

export async function savePriceListSettings(input: unknown, actor: string) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success)
    throw new ComplianceError(
      parsed.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      )
    );
  return db.$transaction(async (tx) => {
    const before = await tx.priceListSettings.findUnique({
      where: { id: "webshop" },
    });
    const after = await tx.priceListSettings.upsert({
      where: { id: "webshop" },
      create: { id: "webshop", ...parsed.data },
      update: parsed.data,
    });
    await tx.priceAnchorAudit.create({
      data: {
        itemKey: "settings:webshop",
        before: JSON.stringify(before),
        after: JSON.stringify(after),
        reason: "Postavke objave cjenika",
        actor,
      },
    });
    return after;
  });
}

function filenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function publishPriceList(now = new Date()) {
  try {
    const publish = () =>
      db.$transaction(
        async (tx) => {
          // One publisher per webshop. The unique local date is a second idempotency guard.
          await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(7462017)`;
          const localDate = zagrebDate(now);
          const settings = await tx.priceListSettings.findUnique({
            where: { id: "webshop" },
          });
          if (!settings?.enabled) return { status: "DISABLED", filename: null };
          const existing = await tx.priceListSnapshot.findUnique({
            where: { localDate },
          });
          if (existing)
            return { status: "EXISTING", filename: existing.filename };
          if (!settings.address.trim() || !settings.objectCode.trim())
            throw new ComplianceError([
              "Nedostaje adresa ili oznaka webshopa.",
            ]);
          const products = await tx.product.findMany({
            where: { status: "ACTIVE" },
            orderBy: { id: "asc" },
            select: catalogSelect,
          });
          const built = buildPriceList(products);
          if (built.errors.length) throw new ComplianceError(built.errors);
          const sequence = settings.sequence + 1;
          const filename = `webshop_${filenamePart(settings.address)}_${settings.objectCode}_${sequence}_${fileTimestamp(now)}.csv`;
          await tx.priceListSnapshot.create({
            data: {
              filename,
              localDate,
              content: built.content,
              checksum: createHash("sha256")
                .update(built.content)
                .digest("hex"),
              rowCount: built.rowCount,
              publishedAt: now,
            },
          });
          await tx.priceListSettings.update({
            where: { id: "webshop" },
            data: { sequence },
          });
          await tx.priceListRun.create({
            data: { status: "PUBLISHED", detail: filename },
          });
          return { status: "PUBLISHED", filename };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 60000,
        }
      );
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await publish();
      } catch (error) {
        if (
          attempt < 2 &&
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034"
        )
          continue;
        throw error;
      }
    }
    throw new Error("Objava nije uspjela.");
  } catch (error) {
    const details =
      error instanceof ComplianceError
        ? error.details
        : ["Objava nije uspjela. Provjerite vezu s bazom i ponovite objavu."];
    await db.priceListRun
      .create({
        data: { status: "FAILED", detail: details.join("\n").slice(0, 10000) },
      })
      .catch(() => undefined);
    if (error instanceof ComplianceError) throw error;
    throw new ComplianceError(details, 503);
  }
}
