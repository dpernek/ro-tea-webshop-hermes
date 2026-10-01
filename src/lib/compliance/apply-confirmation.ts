import type { Prisma } from "@/generated/client";
import type { AnchorRow } from "./catalog";

// Parameterized bulk updates keep large assortments within the transaction timeout.
export async function applyConfirmation(
  tx: Pick<Prisma.TransactionClient, "$executeRaw">,
  rows: AnchorRow[]
) {
  const encoded = JSON.stringify(rows);
  await tx.$executeRaw`
    WITH reviewed AS (SELECT * FROM jsonb_to_recordset(${encoded}::jsonb) AS r(
      "itemKey" text, "anchorPriceCents" integer, "anchorDate" text, "anchorRegime" text,
      barcode text, "barcodeNotApplicable" boolean, "unitMeasure" text, "unitQuantity" double precision,
      "unitNotApplicable" boolean, "brandNotApplicable" boolean, "saleLabel" text, stock integer, "stockStatus" text))
    UPDATE "Product" p SET
      "anchorPriceCents" = r."anchorPriceCents", "anchorDate" = r."anchorDate", "anchorRegime" = r."anchorRegime",
      "anchorConfirmedAt" = COALESCE(p."anchorConfirmedAt", CURRENT_TIMESTAMP),
      barcode = NULLIF(r.barcode, ''), "barcodeNotApplicable" = r."barcodeNotApplicable",
      "unitMeasure" = NULLIF(r."unitMeasure", ''), "unitQuantity" = r."unitQuantity",
      "unitNotApplicable" = r."unitNotApplicable", "brandNotApplicable" = r."brandNotApplicable",
      "saleLabel" = NULLIF(r."saleLabel", ''), stock = r.stock, "stockStatus" = r."stockStatus", "updatedAt" = CURRENT_TIMESTAMP
    FROM reviewed r WHERE r."itemKey" = 'p:' || p.id`;
  await tx.$executeRaw`
    WITH reviewed AS (SELECT * FROM jsonb_to_recordset(${encoded}::jsonb) AS r(
      "itemKey" text, "anchorPriceCents" integer, "anchorDate" text, "anchorRegime" text,
      barcode text, "barcodeNotApplicable" boolean, "unitMeasure" text, "unitQuantity" double precision, "unitNotApplicable" boolean, stock integer))
    UPDATE "ProductVariant" v SET
      "anchorPriceCents" = r."anchorPriceCents", "anchorDate" = r."anchorDate", "anchorRegime" = r."anchorRegime",
      "anchorConfirmedAt" = COALESCE(v."anchorConfirmedAt", CURRENT_TIMESTAMP),
      barcode = NULLIF(r.barcode, ''), "barcodeNotApplicable" = r."barcodeNotApplicable",
      "unitMeasure" = NULLIF(r."unitMeasure", ''), "unitQuantity" = r."unitQuantity", "unitNotApplicable" = r."unitNotApplicable", stock = r.stock, "updatedAt" = CURRENT_TIMESTAMP
    FROM reviewed r WHERE r."itemKey" = 'v:' || v.id`;
  await tx.$executeRaw`
    WITH reviewed AS (SELECT * FROM jsonb_to_recordset(${encoded}::jsonb) AS r(
      "itemKey" text, "brandNotApplicable" boolean, "saleLabel" text)),
    parents AS (SELECT DISTINCT v."productId", r."brandNotApplicable", r."saleLabel"
      FROM reviewed r JOIN "ProductVariant" v ON r."itemKey" = 'v:' || v.id)
    UPDATE "Product" p SET "brandNotApplicable" = r."brandNotApplicable", "saleLabel" = NULLIF(r."saleLabel", ''), "updatedAt" = CURRENT_TIMESTAMP
    FROM parents r WHERE p.id = r."productId"`;
}
