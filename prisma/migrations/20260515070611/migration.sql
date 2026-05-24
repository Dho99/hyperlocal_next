-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "external_source" TEXT,
ADD COLUMN     "opening_hours" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "review_count" INTEGER DEFAULT 0,
ADD COLUMN     "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "halal_facilities" ADD COLUMN     "address" TEXT,
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "external_source" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7);

-- AlterTable
ALTER TABLE "umkms" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "external_source" TEXT,
ADD COLUMN     "opening_hours" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "review_count" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "external_place_sources" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "vendor" TEXT NOT NULL,
    "vendor_place_id" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_place_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_place_sources_vendor_vendor_place_id_key" ON "external_place_sources"("vendor", "vendor_place_id");

-- CreateIndex
CREATE INDEX "destinations_external_id_idx" ON "destinations"("external_id");

-- CreateIndex
CREATE INDEX "halal_facilities_external_id_idx" ON "halal_facilities"("external_id");

-- CreateIndex
CREATE INDEX "umkms_external_id_idx" ON "umkms"("external_id");
