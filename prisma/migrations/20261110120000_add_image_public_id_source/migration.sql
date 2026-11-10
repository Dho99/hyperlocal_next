-- Add Cloudinary public_id and provenance source to image tables.
-- Idempotent so it can be applied safely on databases that already have the columns.

ALTER TABLE "destination_images" ADD COLUMN IF NOT EXISTS "public_id" TEXT;
ALTER TABLE "destination_images" ADD COLUMN IF NOT EXISTS "source" TEXT;
CREATE INDEX IF NOT EXISTS "destination_images_public_id_idx" ON "destination_images"("public_id");

ALTER TABLE "umkm_images" ADD COLUMN IF NOT EXISTS "public_id" TEXT;
ALTER TABLE "umkm_images" ADD COLUMN IF NOT EXISTS "source" TEXT;
CREATE INDEX IF NOT EXISTS "umkm_images_public_id_idx" ON "umkm_images"("public_id");

ALTER TABLE "accommodation_images" ADD COLUMN IF NOT EXISTS "public_id" TEXT;
ALTER TABLE "accommodation_images" ADD COLUMN IF NOT EXISTS "source" TEXT;
CREATE INDEX IF NOT EXISTS "accommodation_images_public_id_idx" ON "accommodation_images"("public_id");
