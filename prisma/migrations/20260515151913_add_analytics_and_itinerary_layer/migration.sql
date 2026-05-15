-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'SEARCH', 'CLICK', 'SAVE', 'SHARE', 'ROUTE');

-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "destination_interactions" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "InteractionType" NOT NULL,
    "keyword" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_trends" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "route_count" INTEGER NOT NULL DEFAULT 0,
    "trend_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sentiments" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "label" "SentimentLabel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "keywords" TEXT[],
    "summary" TEXT,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_sentiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "itinerary_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL,
    "estimated_time" INTEGER,
    "notes" TEXT,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halal_readiness_scores" (
    "id" TEXT NOT NULL,
    "region_name" TEXT NOT NULL,
    "region_type" TEXT NOT NULL,
    "destination_count" INTEGER NOT NULL DEFAULT 0,
    "halal_facility_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "halal_food_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "worship_access_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transport_access_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recommendation" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "halal_readiness_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "destination_interactions_destination_id_type_created_at_idx" ON "destination_interactions"("destination_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "destination_interactions_user_id_idx" ON "destination_interactions"("user_id");

-- CreateIndex
CREATE INDEX "destination_interactions_created_at_idx" ON "destination_interactions"("created_at");

-- CreateIndex
CREATE INDEX "destination_trends_period_period_start_trend_score_idx" ON "destination_trends"("period", "period_start", "trend_score");

-- CreateIndex
CREATE UNIQUE INDEX "destination_trends_destination_id_period_period_start_key" ON "destination_trends"("destination_id", "period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "review_sentiments_review_id_key" ON "review_sentiments"("review_id");

-- CreateIndex
CREATE INDEX "review_sentiments_label_idx" ON "review_sentiments"("label");

-- CreateIndex
CREATE INDEX "itineraries_user_id_idx" ON "itineraries"("user_id");

-- CreateIndex
CREATE INDEX "itinerary_items_itinerary_id_idx" ON "itinerary_items"("itinerary_id");

-- CreateIndex
CREATE INDEX "itinerary_items_destination_id_idx" ON "itinerary_items"("destination_id");

-- CreateIndex
CREATE INDEX "halal_readiness_scores_region_name_region_type_idx" ON "halal_readiness_scores"("region_name", "region_type");

-- AddForeignKey
ALTER TABLE "destination_interactions" ADD CONSTRAINT "destination_interactions_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_interactions" ADD CONSTRAINT "destination_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_trends" ADD CONSTRAINT "destination_trends_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sentiments" ADD CONSTRAINT "review_sentiments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
