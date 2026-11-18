-- One survey response per authenticated user per destination.
-- Keep the newest row for each (destination_id, user_id) pair; anonymous
-- legacy rows (user_id IS NULL) are left untouched.

DELETE FROM "destination_survey_responses" AS older
USING "destination_survey_responses" AS newer
WHERE older."destination_id" = newer."destination_id"
  AND older."user_id" = newer."user_id"
  AND older."user_id" IS NOT NULL
  AND (
      older."created_at" < newer."created_at"
      OR (older."created_at" = newer."created_at" AND older."id" < newer."id")
  );

CREATE UNIQUE INDEX "destination_survey_responses_destination_id_user_id_key"
ON "destination_survey_responses"("destination_id", "user_id");

-- Recompute the public aggregate after deduplication so review counts never
-- include removed duplicates.
UPDATE "destinations" AS destination
SET
    "rating" = aggregate.rating,
    "review_count" = aggregate.review_count
FROM (
    SELECT
        "destination_id",
        ROUND((AVG("overall_score") / 20)::numeric, 1)::double precision AS rating,
        COUNT(*)::integer AS review_count
    FROM "destination_survey_responses"
    WHERE "score_hidden_at" IS NULL
      AND "overall_score" IS NOT NULL
    GROUP BY "destination_id"
) AS aggregate
WHERE destination."id" = aggregate."destination_id";

UPDATE "destinations" AS destination
SET "rating" = 0, "review_count" = 0
WHERE NOT EXISTS (
    SELECT 1
    FROM "destination_survey_responses" AS survey
    WHERE survey."destination_id" = destination."id"
      AND survey."score_hidden_at" IS NULL
      AND survey."overall_score" IS NOT NULL
);
