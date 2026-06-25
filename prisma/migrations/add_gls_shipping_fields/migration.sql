-- Add missing GLS shipping columns to Order table (idempotent)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "glsShipmentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "glsParcelNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "glsLabelData" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "glsStatusData" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "glsCreatedAt" TIMESTAMP(3);
