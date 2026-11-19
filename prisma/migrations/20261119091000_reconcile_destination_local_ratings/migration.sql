WITH review_agg AS (
  SELECT "destination_id" AS id, AVG("rating")::DOUBLE PRECISION AS avg_rating,
         COUNT(*)::INTEGER AS count
  FROM "reviews" WHERE "destination_id" IS NOT NULL GROUP BY "destination_id"
), survey_agg AS (
  SELECT "destination_id" AS id, (AVG("overall_score") / 20)::DOUBLE PRECISION AS avg_rating,
         COUNT(*)::INTEGER AS count
  FROM "destination_survey_responses"
  WHERE "score_hidden_at" IS NULL AND "overall_score" IS NOT NULL
  GROUP BY "destination_id"
), combined AS (
  SELECT COALESCE(r.id, s.id) AS id,
    CASE WHEN COALESCE(r.count, 0) + COALESCE(s.count, 0) = 0 THEN 0
      ELSE (COALESCE(r.avg_rating, 0) * COALESCE(r.count, 0) + COALESCE(s.avg_rating, 0) * COALESCE(s.count, 0)) /
        (COALESCE(r.count, 0) + COALESCE(s.count, 0)) END AS avg_rating,
    COALESCE(r.count, 0) + COALESCE(s.count, 0) AS count
  FROM review_agg r FULL OUTER JOIN survey_agg s ON r.id = s.id
)
UPDATE "destinations" d
SET "rating" = c.avg_rating, "review_count" = c.count
FROM combined c WHERE d."id" = c.id;
