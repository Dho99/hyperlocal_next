-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "category_scores" JSONB,
ADD COLUMN     "halal_score" INTEGER,
ADD COLUMN     "validated_score" INTEGER;
