-- CreateEnum
CREATE TYPE "PhotoValidityStatus" AS ENUM ('PENDING', 'VALID', 'INVALID_POSITION', 'INVALID_TIME', 'NO_METADATA');

-- AlterTable
ALTER TABLE "halal_facilities" ADD COLUMN "photo_tolerance_meters" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "destination_images" ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "captured_at" TIMESTAMP(3),
ADD COLUMN "distance_meters" INTEGER,
ADD COLUMN "position_valid" BOOLEAN,
ADD COLUMN "time_valid" BOOLEAN,
ADD COLUMN "validity_status" "PhotoValidityStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "validity_notes" TEXT;

-- AlterTable
ALTER TABLE "destination_facility_evidences" ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "captured_at" TIMESTAMP(3),
ADD COLUMN "distance_meters" INTEGER,
ADD COLUMN "position_valid" BOOLEAN,
ADD COLUMN "time_valid" BOOLEAN,
ADD COLUMN "validity_status" "PhotoValidityStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "validity_notes" TEXT;

-- CreateTable
CREATE TABLE "photo_metadata" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "captured_at" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exif" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_metadata_url_key" ON "photo_metadata"("url");
