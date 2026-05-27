/*
  Warnings:

  - You are about to drop the column `notes` on the `halal_validations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `halal_validations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "halal_certifications" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "halal_validations" DROP COLUMN "notes",
DROP COLUMN "status";
