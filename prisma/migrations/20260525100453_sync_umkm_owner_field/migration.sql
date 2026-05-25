/*
  Warnings:

  - The values [umkm_owner] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `owner_id` on the `umkms` table. All the data in the column will be lost.
  - Added the required column `owner` to the `umkms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('user', 'admin');
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "umkms" DROP CONSTRAINT "umkms_owner_id_fkey";

-- DropIndex
DROP INDEX "umkms_owner_id_idx";

-- AlterTable
ALTER TABLE "umkms" DROP COLUMN "owner_id",
ADD COLUMN     "owner" TEXT NOT NULL;
