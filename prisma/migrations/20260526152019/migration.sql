-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('PENDING', 'VALID', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'SEARCH', 'CLICK', 'SAVE', 'SHARE', 'ROUTE');

-- CreateEnum
CREATE TYPE "SentimentLabel" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" JSONB,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "rating" DOUBLE PRECISION DEFAULT 0,
    "review_count" INTEGER DEFAULT 0,
    "opening_hours" JSONB,
    "external_id" TEXT,
    "external_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_images" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination_halal_facilities" (
    "destination_id" TEXT NOT NULL,
    "facility_id" TEXT NOT NULL,

    CONSTRAINT "destination_halal_facilities_pkey" PRIMARY KEY ("destination_id","facility_id")
);

-- CreateTable
CREATE TABLE "halal_facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "facility_type" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "external_id" TEXT,
    "external_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "weight" INTEGER DEFAULT 0,

    CONSTRAINT "halal_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination_id" TEXT,
    "umkm_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "umkms" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "rating" DOUBLE PRECISION DEFAULT 0,
    "review_count" INTEGER DEFAULT 0,
    "opening_hours" JSONB,
    "external_id" TEXT,
    "external_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,

    CONSTRAINT "umkms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umkm_images" (
    "id" TEXT NOT NULL,
    "umkm_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "umkm_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halal_certifications" (
    "id" TEXT NOT NULL,
    "umkm_id" TEXT NOT NULL,
    "certificate_no" TEXT,
    "issuer" TEXT,
    "issued_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "status" "CertificationStatus" NOT NULL DEFAULT 'PENDING',
    "document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "halal_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halal_validations" (
    "id" TEXT NOT NULL,
    "certification_id" TEXT NOT NULL,
    "validator_id" TEXT,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "halal_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_evidences" (
    "id" TEXT NOT NULL,
    "validation_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_place_sources" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "vendor" TEXT NOT NULL,
    "vendor_place_id" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_place_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_category_id_idx" ON "destinations"("category_id");

-- CreateIndex
CREATE INDEX "destinations_external_id_idx" ON "destinations"("external_id");

-- CreateIndex
CREATE INDEX "destination_images_destination_id_idx" ON "destination_images"("destination_id");

-- CreateIndex
CREATE INDEX "destination_halal_facilities_facility_id_idx" ON "destination_halal_facilities"("facility_id");

-- CreateIndex
CREATE INDEX "halal_facilities_external_id_idx" ON "halal_facilities"("external_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_destination_id_idx" ON "reviews"("destination_id");

-- CreateIndex
CREATE INDEX "reviews_umkm_id_idx" ON "reviews"("umkm_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "umkms_slug_key" ON "umkms"("slug");

-- CreateIndex
CREATE INDEX "umkms_destination_id_idx" ON "umkms"("destination_id");

-- CreateIndex
CREATE INDEX "umkms_category_id_idx" ON "umkms"("category_id");

-- CreateIndex
CREATE INDEX "umkms_external_id_idx" ON "umkms"("external_id");

-- CreateIndex
CREATE INDEX "umkm_images_umkm_id_idx" ON "umkm_images"("umkm_id");

-- CreateIndex
CREATE UNIQUE INDEX "halal_certifications_certificate_no_key" ON "halal_certifications"("certificate_no");

-- CreateIndex
CREATE INDEX "halal_certifications_umkm_id_idx" ON "halal_certifications"("umkm_id");

-- CreateIndex
CREATE INDEX "halal_validations_certification_id_idx" ON "halal_validations"("certification_id");

-- CreateIndex
CREATE INDEX "halal_validations_validator_id_idx" ON "halal_validations"("validator_id");

-- CreateIndex
CREATE INDEX "validation_evidences_validation_id_idx" ON "validation_evidences"("validation_id");

-- CreateIndex
CREATE UNIQUE INDEX "external_place_sources_vendor_vendor_place_id_key" ON "external_place_sources"("vendor", "vendor_place_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_images" ADD CONSTRAINT "destination_images_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_halal_facilities" ADD CONSTRAINT "destination_halal_facilities_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_halal_facilities" ADD CONSTRAINT "destination_halal_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "halal_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "umkms" ADD CONSTRAINT "umkms_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkms" ADD CONSTRAINT "umkms_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umkm_images" ADD CONSTRAINT "umkm_images_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halal_certifications" ADD CONSTRAINT "halal_certifications_umkm_id_fkey" FOREIGN KEY ("umkm_id") REFERENCES "umkms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halal_validations" ADD CONSTRAINT "halal_validations_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "halal_certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halal_validations" ADD CONSTRAINT "halal_validations_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_evidences" ADD CONSTRAINT "validation_evidences_validation_id_fkey" FOREIGN KEY ("validation_id") REFERENCES "halal_validations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
