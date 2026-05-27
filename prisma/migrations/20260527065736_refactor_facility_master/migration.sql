/*
  Warnings:

  - The primary key for the `destination_halal_facilities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `halal_facilities` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `halal_facilities` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `halal_facilities` table. All the data in the column will be lost.
  - The required column `id` was added to the `destination_halal_facilities` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "destination_halal_facilities" DROP CONSTRAINT "destination_halal_facilities_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD CONSTRAINT "destination_halal_facilities_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "halal_facilities" DROP COLUMN "address",
DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "halal_validations" ADD COLUMN     "destination_id" TEXT,
ALTER COLUMN "certification_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "destination_facility_evidences" (
    "id" TEXT NOT NULL,
    "dest_facility_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_facility_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "destination_facility_evidences_dest_facility_id_idx" ON "destination_facility_evidences"("dest_facility_id");

-- CreateIndex
CREATE INDEX "destination_halal_facilities_destination_id_idx" ON "destination_halal_facilities"("destination_id");

-- CreateIndex
CREATE INDEX "halal_validations_destination_id_idx" ON "halal_validations"("destination_id");

-- AddForeignKey
ALTER TABLE "destination_facility_evidences" ADD CONSTRAINT "destination_facility_evidences_dest_facility_id_fkey" FOREIGN KEY ("dest_facility_id") REFERENCES "destination_halal_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halal_validations" ADD CONSTRAINT "halal_validations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
