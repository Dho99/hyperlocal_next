-- AlterTable
ALTER TABLE "halal_validations" ADD COLUMN     "admin_score" INTEGER,
ADD COLUMN     "category_scores" JSONB;
