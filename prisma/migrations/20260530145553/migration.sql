-- AlterEnum
ALTER TYPE "CategoryType" ADD VALUE 'ACCOMMODATION';

-- AlterTable
ALTER TABLE "destination_halal_facilities" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "accommodation_id" TEXT;

-- AlterTable
ALTER TABLE "umkms" ADD COLUMN     "surveyor_note" TEXT,
ADD COLUMN     "validation_status" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "accommodations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" JSONB,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "phone" TEXT,
    "website" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "review_count" INTEGER DEFAULT 0,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "surveyor_note" TEXT,
    "validated_score" INTEGER,
    "external_id" TEXT,
    "external_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_images" (
    "id" TEXT NOT NULL,
    "accommodation_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accommodation_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_halal_facilities" (
    "id" TEXT NOT NULL,
    "accommodation_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "accommodation_halal_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umkm_halal_facilities" (
    "id" TEXT NOT NULL,
    "umkm_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "umkm_halal_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accommodations_slug_key" ON "accommodations"("slug");

-- CreateIndex
CREATE INDEX "accommodations_external_id_idx" ON "accommodations"("external_id");

-- CreateIndex
CREATE INDEX "accommodation_images_accommodation_id_idx" ON "accommodation_images"("accommodation_id");

-- CreateIndex
CREATE INDEX "accommodation_halal_facilities_accommodation_id_idx" ON "accommodation_halal_facilities"("accommodation_id");

-- CreateIndex
CREATE INDEX "accommodation_halal_facilities_facility_id_idx" ON "accommodation_halal_facilities"("facility_id");

-- CreateIndex
CREATE INDEX "umkm_halal_facilities_umkm_id_idx" ON "umkm_halal_facilities"("umkm_id");

-- CreateIndex
CREATE INDEX "umkm_halal_facilities_facility_id_idx" ON "umkm_halal_facilities"("facility_id");

-- CreateIndex
CREATE INDEX "reviews_accommodation_id_idx" ON "reviews"("accommodation_id");

-- AddForeignKey
ALTER TABLE "accommodation_images" ADD CONSTRAINT "accommodation_images_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_halal_facilities" ADD CONSTRAINT "accommodation_halal_facilities_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_halal_facilities" ADD CONSTRAINT "accommodation_halal_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "halal_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_accommodation_id_fkey" FOREIGN KEY ("accommodation_id") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkm_halal_facilities" ADD CONSTRAINT "umkm_halal_facilities_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkm_halal_facilities" ADD CONSTRAINT "umkm_halal_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "halal_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
