-- CreateEnum
CREATE TYPE "AceshIndicatorGroup" AS ENUM ('ACCESS', 'COMMUNICATION', 'ENVIRONMENT', 'SERVICES', 'SPATIAL_ACCESSIBILITY', 'FUNCTIONAL_AVAILABILITY', 'HALAL_ASSURANCE', 'ECOSYSTEM_CONNECTIVITY', 'EMBEDDEDNESS_CONTINUITY');

-- CreateEnum
CREATE TYPE "AceshEvidenceType" AS ENUM ('SOURCE', 'DOCUMENT', 'PHOTO', 'GEOLOCATION', 'MANAGEMENT_CONFIRMATION', 'FIELD_VALIDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "AceshTravelMode" AS ENUM ('WALKING', 'DRIVING', 'CYCLING');

-- CreateEnum
CREATE TYPE "AceshVerificationStatus" AS ENUM ('PENDING', 'VERIFIED');

-- AlterTable
ALTER TABLE "destination_halal_facilities" ADD COLUMN     "distance_meters" INTEGER,
ADD COLUMN     "travel_minutes" INTEGER,
ADD COLUMN     "travel_mode" TEXT;

-- AlterTable
ALTER TABLE "halal_facilities" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7);

-- CreateTable
CREATE TABLE "acesh_indicators" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "AceshIndicatorGroup" NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesh_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesh_indicator_scores" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "indicator_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "converted_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "assessed_by" TEXT,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acesh_indicator_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesh_evidence_records" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "evidence_type" "AceshEvidenceType" NOT NULL DEFAULT 'OTHER',
    "source" TEXT,
    "source_reliability_score" INTEGER,
    "document_url" TEXT,
    "photo_url" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "management_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "field_validated" BOOLEAN NOT NULL DEFAULT false,
    "data_date" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "validator_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesh_evidence_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesh_assessments" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "aces_score" DOUBLE PRECISION NOT NULL,
    "hyperlocal_score" DOUBLE PRECISION NOT NULL,
    "base_score" DOUBLE PRECISION NOT NULL,
    "evidence_confidence_score" DOUBLE PRECISION NOT NULL,
    "evidence_factor" DOUBLE PRECISION NOT NULL,
    "verified_score" DOUBLE PRECISION,
    "classification" TEXT,
    "verification_status" "AceshVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "calculation_version" TEXT NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesh_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesh_assessment_history" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "aces_score" DOUBLE PRECISION NOT NULL,
    "hyperlocal_score" DOUBLE PRECISION NOT NULL,
    "base_score" DOUBLE PRECISION NOT NULL,
    "evidence_confidence_score" DOUBLE PRECISION NOT NULL,
    "evidence_factor" DOUBLE PRECISION NOT NULL,
    "verified_score" DOUBLE PRECISION,
    "classification" TEXT,
    "verification_status" "AceshVerificationStatus" NOT NULL,
    "calculation_version" TEXT NOT NULL,
    "calculated_by" TEXT,
    "notes" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesh_assessment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reachability_configs" (
    "id" TEXT NOT NULL,
    "facility_type" TEXT NOT NULL,
    "label" TEXT,
    "max_distance_meters" INTEGER,
    "max_travel_minutes" INTEGER,
    "travel_mode" "AceshTravelMode" NOT NULL DEFAULT 'WALKING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reachability_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "acesh_indicators_code_key" ON "acesh_indicators"("code");

-- CreateIndex
CREATE INDEX "acesh_indicators_group_idx" ON "acesh_indicators"("group");

-- CreateIndex
CREATE INDEX "acesh_indicator_scores_indicator_id_idx" ON "acesh_indicator_scores"("indicator_id");

-- CreateIndex
CREATE UNIQUE INDEX "acesh_indicator_scores_destination_id_indicator_id_key" ON "acesh_indicator_scores"("destination_id", "indicator_id");

-- CreateIndex
CREATE INDEX "acesh_evidence_records_destination_id_idx" ON "acesh_evidence_records"("destination_id");

-- CreateIndex
CREATE INDEX "acesh_evidence_records_validator_id_idx" ON "acesh_evidence_records"("validator_id");

-- CreateIndex
CREATE UNIQUE INDEX "acesh_assessments_destination_id_key" ON "acesh_assessments"("destination_id");

-- CreateIndex
CREATE INDEX "acesh_assessment_history_destination_id_calculated_at_idx" ON "acesh_assessment_history"("destination_id", "calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "reachability_configs_facility_type_key" ON "reachability_configs"("facility_type");

-- CreateIndex
-- Deduplicate existing destination-facility joins before applying the unique constraint
-- (keeps the earliest row per destination+facility pair).
DELETE FROM "destination_halal_facilities" dhf
USING "destination_halal_facilities" dhf2
WHERE dhf."destination_id" = dhf2."destination_id"
  AND dhf."facility_id" = dhf2."facility_id"
  AND dhf."id" > dhf2."id";

CREATE UNIQUE INDEX "destination_halal_facilities_destination_id_facility_id_key" ON "destination_halal_facilities"("destination_id", "facility_id");

-- AddForeignKey
ALTER TABLE "acesh_indicator_scores" ADD CONSTRAINT "acesh_indicator_scores_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesh_indicator_scores" ADD CONSTRAINT "acesh_indicator_scores_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "acesh_indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesh_evidence_records" ADD CONSTRAINT "acesh_evidence_records_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesh_evidence_records" ADD CONSTRAINT "acesh_evidence_records_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesh_assessments" ADD CONSTRAINT "acesh_assessments_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesh_assessment_history" ADD CONSTRAINT "acesh_assessment_history_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

