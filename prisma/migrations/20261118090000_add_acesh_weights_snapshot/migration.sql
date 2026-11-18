-- Persist the exact ACES-H weights used for every assessment snapshot so old
-- scores stay reproducible after the active configuration changes.
ALTER TABLE "acesh_assessment_history"
ADD COLUMN IF NOT EXISTS "weights_snapshot" JSONB;
