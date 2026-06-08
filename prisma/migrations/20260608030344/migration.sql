-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "coverage_area_id" TEXT;

-- AlterTable
ALTER TABLE "umkms" ADD COLUMN     "coverage_area_id" TEXT;

-- CreateTable
CREATE TABLE "coverage_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "geoJsonData" JSONB NOT NULL,
    "colorHex" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coverage_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "destinations_coverage_area_id_idx" ON "destinations"("coverage_area_id");

-- CreateIndex
CREATE INDEX "umkms_coverage_area_id_idx" ON "umkms"("coverage_area_id");

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_coverage_area_id_fkey" FOREIGN KEY ("coverage_area_id") REFERENCES "coverage_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkms" ADD CONSTRAINT "umkms_coverage_area_id_fkey" FOREIGN KEY ("coverage_area_id") REFERENCES "coverage_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
