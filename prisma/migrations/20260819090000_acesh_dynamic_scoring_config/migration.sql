CREATE TABLE "acesh_scoring_configs" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "version" TEXT NOT NULL DEFAULT 'ACES-H-1.0',
    "access_weight" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "communication_weight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "environment_weight" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "services_weight" DOUBLE PRECISION NOT NULL DEFAULT 45,
    "spatial_accessibility_weight" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "functional_availability_weight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "halal_assurance_weight" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "ecosystem_connectivity_weight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "embeddedness_continuity_weight" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "source_reliability_weight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "document_evidence_weight" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "photo_geolocation_weight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "management_confirmation_weight" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "field_validation_weight" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "data_freshness_weight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "base_aces_weight" DOUBLE PRECISION NOT NULL DEFAULT 65,
    "base_hyperlocal_weight" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "evidence_factor_base" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "evidence_factor_range" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesh_scoring_configs_pkey" PRIMARY KEY ("id")
);

INSERT INTO "acesh_scoring_configs" ("id", "updated_at")
VALUES ('default', CURRENT_TIMESTAMP);
