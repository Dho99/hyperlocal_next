-- CreateEnum
CREATE TYPE "RecommendationActionType" AS ENUM ('BUILD', 'IMPROVE', 'VERIFY', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "RecommendationTimeline" AS ENUM ('QUICK', 'MEDIUM', 'STRATEGIC');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'SUBMITTED', 'VALIDATING', 'VERIFIED');

-- CreateTable
CREATE TABLE "recommendation_actions" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "indicator_id" TEXT,
    "rule_id" TEXT,
    "action_type" "RecommendationActionType" NOT NULL,
    "timeline" "RecommendationTimeline" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority_score" DOUBLE PRECISION NOT NULL,
    "ris" DOUBLE PRECISION,
    "gap" DOUBLE PRECISION,
    "reason" JSONB,
    "before_after" JSONB,
    "prerequisite" JSONB,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "recommendation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recommendation_actions_destination_id_idx" ON "recommendation_actions"("destination_id");

-- CreateIndex
CREATE INDEX "recommendation_actions_indicator_id_idx" ON "recommendation_actions"("indicator_id");

-- CreateIndex
CREATE INDEX "recommendation_actions_status_idx" ON "recommendation_actions"("status");

-- AddForeignKey
ALTER TABLE "recommendation_actions" ADD CONSTRAINT "recommendation_actions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_actions" ADD CONSTRAINT "recommendation_actions_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "acesh_indicators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
