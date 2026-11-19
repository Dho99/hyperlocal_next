ALTER TABLE "destinations"
  ADD COLUMN "external_rating" DOUBLE PRECISION,
  ADD COLUMN "external_review_count" INTEGER,
  ADD COLUMN "external_rating_source" TEXT;

ALTER TABLE "umkms"
  ADD COLUMN "external_rating" DOUBLE PRECISION,
  ADD COLUMN "external_review_count" INTEGER,
  ADD COLUMN "external_rating_source" TEXT;

ALTER TABLE "accommodations"
  ADD COLUMN "external_rating" DOUBLE PRECISION,
  ADD COLUMN "external_review_count" INTEGER,
  ADD COLUMN "external_rating_source" TEXT;

-- Existing metrics were imported ratings/counts, except destinations that already
-- have survey responses. Preserve them as external data before resetting the
-- canonical fields to local aggregates.
UPDATE "destinations" d
SET "external_rating" = d."rating",
    "external_review_count" = d."review_count",
    "external_rating_source" = COALESCE(d."external_source", 'imported')
WHERE NOT EXISTS (
  SELECT 1 FROM "destination_survey_responses" s
  WHERE s."destination_id" = d."id"
);

UPDATE "umkms"
SET "external_rating" = "rating",
    "external_review_count" = "review_count",
    "external_rating_source" = COALESCE("external_source", 'imported');

UPDATE "accommodations"
SET "external_rating" = "rating",
    "external_review_count" = "review_count",
    "external_rating_source" = COALESCE("external_source", 'imported');

UPDATE "destinations" SET "rating" = 0, "review_count" = 0;
UPDATE "umkms" SET "rating" = 0, "review_count" = 0;
UPDATE "accommodations" SET "rating" = 0, "review_count" = 0;

-- Rebuild the canonical local review aggregates.
UPDATE "destinations" d
SET "rating" = a.average_rating,
    "review_count" = a.review_count
FROM (
  SELECT "destination_id", AVG("rating")::DOUBLE PRECISION AS average_rating,
         COUNT(*)::INTEGER AS review_count
  FROM "reviews" WHERE "destination_id" IS NOT NULL
  GROUP BY "destination_id"
) a WHERE d."id" = a."destination_id";

UPDATE "umkms" u
SET "rating" = a.average_rating,
    "review_count" = a.review_count
FROM (
  SELECT "umkm_id", AVG("rating")::DOUBLE PRECISION AS average_rating,
         COUNT(*)::INTEGER AS review_count
  FROM "reviews" WHERE "umkm_id" IS NOT NULL
  GROUP BY "umkm_id"
) a WHERE u."id" = a."umkm_id";

UPDATE "accommodations" a
SET "rating" = r.average_rating,
    "review_count" = r.review_count
FROM (
  SELECT "accommodation_id", AVG("rating")::DOUBLE PRECISION AS average_rating,
         COUNT(*)::INTEGER AS review_count
  FROM "reviews" WHERE "accommodation_id" IS NOT NULL
  GROUP BY "accommodation_id"
) r WHERE a."id" = r."accommodation_id";

-- Destination surveys are the local rating source for destinations.
UPDATE "destinations" d
SET "rating" = s.average_rating,
    "review_count" = s.review_count
FROM (
  SELECT "destination_id", (AVG("overall_score") / 20)::DOUBLE PRECISION AS average_rating,
         COUNT(*)::INTEGER AS review_count
  FROM "destination_survey_responses"
  WHERE "score_hidden_at" IS NULL AND "overall_score" IS NOT NULL
  GROUP BY "destination_id"
) s WHERE d."id" = s."destination_id";
