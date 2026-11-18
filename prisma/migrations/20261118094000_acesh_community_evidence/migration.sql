-- Track how much of the Evidence Confidence comes from official evidence
-- records versus community survey self-ratings.
ALTER TABLE "acesh_assessments"
ADD COLUMN IF NOT EXISTS "official_evidence_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "community_evidence_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "community_evidence_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "evidence_source" TEXT;

ALTER TABLE "acesh_assessment_history"
ADD COLUMN IF NOT EXISTS "official_evidence_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "community_evidence_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "community_evidence_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "evidence_source" TEXT;
