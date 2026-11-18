-- Ensure every environment has the ACES-H 1.0 defaults for all three scoring
-- layers (ACES readiness, hyperlocal, evidence confidence) plus the base
-- composition and evidence factor. Existing admin-edited rows are preserved.
INSERT INTO "acesh_scoring_configs" (
    "id",
    "version",
    "access_weight",
    "communication_weight",
    "environment_weight",
    "services_weight",
    "spatial_accessibility_weight",
    "functional_availability_weight",
    "halal_assurance_weight",
    "ecosystem_connectivity_weight",
    "embeddedness_continuity_weight",
    "source_reliability_weight",
    "document_evidence_weight",
    "photo_geolocation_weight",
    "management_confirmation_weight",
    "field_validation_weight",
    "data_freshness_weight",
    "base_aces_weight",
    "base_hyperlocal_weight",
    "evidence_factor_base",
    "evidence_factor_range",
    "updated_by",
    "updated_at"
)
SELECT
    'default',
    'ACES-H-1.0',
    20, 15, 20, 45,
    30, 25, 20, 15, 10,
    15, 20, 15, 10, 25, 15,
    65, 35,
    70, 30,
    'migration',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "acesh_scoring_configs" WHERE "id" = 'default'
);
