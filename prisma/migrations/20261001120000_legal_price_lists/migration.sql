-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "anchorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "anchorDate" TEXT,
ADD COLUMN     "anchorPriceCents" INTEGER,
ADD COLUMN     "anchorRegime" TEXT,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "barcodeNotApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brandNotApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleLabel" TEXT,
ADD COLUMN     "unitMeasure" TEXT,
ADD COLUMN     "unitNotApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unitQuantity" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "anchorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "anchorDate" TEXT,
ADD COLUMN     "anchorPriceCents" INTEGER,
ADD COLUMN     "anchorRegime" TEXT,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "barcodeNotApplicable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unitMeasure" TEXT,
ADD COLUMN     "unitQuantity" DOUBLE PRECISION,
ADD COLUMN     "unitNotApplicable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PriceListSettings" (
    "id" TEXT NOT NULL DEFAULT 'webshop',
    "address" TEXT NOT NULL DEFAULT '',
    "objectCode" TEXT NOT NULL DEFAULT 'WEB-01',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceListSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAnchorAudit" (
    "id" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceAnchorAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListSnapshot" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceListSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceListRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceListRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceAnchorAudit_itemKey_createdAt_idx" ON "PriceAnchorAudit"("itemKey", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListSnapshot_filename_key" ON "PriceListSnapshot"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListSnapshot_localDate_key" ON "PriceListSnapshot"("localDate");

-- The application uses a server-side database connection. No new evidence or
-- settings tables should be exposed through Supabase's public Data API.
ALTER TABLE "PriceListSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceAnchorAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceListSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceListRun" ENABLE ROW LEVEL SECURITY;

-- Confirmed historical prices are protected from all import/update paths.
CREATE FUNCTION protect_confirmed_price_anchor() RETURNS trigger AS $$
BEGIN
  IF OLD."anchorConfirmedAt" IS NOT NULL AND (
    NEW."anchorPriceCents" IS DISTINCT FROM OLD."anchorPriceCents" OR
    NEW."anchorDate" IS DISTINCT FROM OLD."anchorDate" OR
    NEW."anchorRegime" IS DISTINCT FROM OLD."anchorRegime" OR
    NEW."anchorConfirmedAt" IS DISTINCT FROM OLD."anchorConfirmedAt"
  ) THEN
    RAISE EXCEPTION 'Confirmed price anchors require a separately reviewed correction';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER protect_product_anchor BEFORE UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION protect_confirmed_price_anchor();
CREATE TRIGGER protect_variant_anchor BEFORE UPDATE ON "ProductVariant"
FOR EACH ROW EXECUTE FUNCTION protect_confirmed_price_anchor();

CREATE FUNCTION protect_price_evidence() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Published price evidence is append-only';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER protect_anchor_audit BEFORE UPDATE OR DELETE ON "PriceAnchorAudit"
FOR EACH ROW EXECUTE FUNCTION protect_price_evidence();
CREATE TRIGGER protect_published_price_list BEFORE UPDATE OR DELETE ON "PriceListSnapshot"
FOR EACH ROW EXECUTE FUNCTION protect_price_evidence();

ALTER TABLE "Product" ADD CONSTRAINT "Product_anchor_complete" CHECK (
  "anchorConfirmedAt" IS NULL OR ("anchorPriceCents" IS NOT NULL AND "anchorPriceCents" >= 0 AND "anchorDate" IS NOT NULL AND "anchorRegime" IS NOT NULL AND "anchorRegime" IN ('GENERAL_2026', 'LEGACY_2025', 'FIRST_LISTED'))
);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_anchor_complete" CHECK (
  "anchorConfirmedAt" IS NULL OR ("anchorPriceCents" IS NOT NULL AND "anchorPriceCents" >= 0 AND "anchorDate" IS NOT NULL AND "anchorRegime" IS NOT NULL AND "anchorRegime" IN ('GENERAL_2026', 'LEGACY_2025', 'FIRST_LISTED'))
);
