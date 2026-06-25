-- Migration: add GLS paketomat pickup point fields to Order
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "glsPickupPointId" TEXT,
ADD COLUMN IF NOT EXISTS "glsPickupPointName" TEXT,
ADD COLUMN IF NOT EXISTS "glsPickupPointAddress" TEXT;
