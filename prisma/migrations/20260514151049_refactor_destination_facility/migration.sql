/*
  Warnings:

  - You are about to drop the column `destination_id` on the `halal_facilities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "halal_facilities" DROP CONSTRAINT "halal_facilities_destination_id_fkey";

-- DropIndex
DROP INDEX "halal_facilities_destination_id_idx";

-- AlterTable
ALTER TABLE "halal_facilities" DROP COLUMN "destination_id";

-- CreateTable
CREATE TABLE "destination_halal_facilities" (
    "destination_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,

    CONSTRAINT "destination_halal_facilities_pkey" PRIMARY KEY ("destination_id","facility_id")
);

-- CreateIndex
CREATE INDEX "destination_halal_facilities_facility_id_idx" ON "destination_halal_facilities"("facility_id");

-- AddForeignKey
ALTER TABLE "destination_halal_facilities" ADD CONSTRAINT "destination_halal_facilities_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_halal_facilities" ADD CONSTRAINT "destination_halal_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "halal_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
