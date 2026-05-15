/*
  Warnings:

  - The `description` column on the `destinations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "destinations" DROP COLUMN "description",
ADD COLUMN     "description" JSONB;
