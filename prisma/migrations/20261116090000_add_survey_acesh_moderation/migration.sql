ALTER TABLE "destination_survey_responses"
ADD COLUMN IF NOT EXISTS "score_hidden_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "score_hidden_by" TEXT,
ADD COLUMN IF NOT EXISTS "comment_hidden_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "comment_hidden_by" TEXT;

CREATE INDEX IF NOT EXISTS "destination_survey_responses_score_hidden_at_idx"
ON "destination_survey_responses"("score_hidden_at");

ALTER TABLE "acesh_indicator_scores"
ADD COLUMN IF NOT EXISTS "admin_value" INTEGER;

UPDATE "acesh_indicator_scores"
SET "admin_value" = "value"
WHERE "admin_value" IS NULL;
