/*
  Warnings:

  - A unique constraint covering the columns `[slug,type]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('DESTINATION', 'UMKM');

-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "type" "CategoryType" NOT NULL DEFAULT 'DESTINATION';

-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_type_key" ON "categories"("slug", "type");
