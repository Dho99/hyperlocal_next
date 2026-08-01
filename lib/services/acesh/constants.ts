import type { AceshIndicatorGroup } from "@/lib/generated/prisma";

export const ACESH_CALCULATION_VERSION = "ACES-H-1.0";

/** ACES Readiness dimensions and mandatory weights (must sum to exactly 100%). */
export const ACES_DIMENSION_WEIGHTS: Record<
    "ACCESS" | "COMMUNICATION" | "ENVIRONMENT" | "SERVICES",
    number
> = {
    ACCESS: 0.2,
    COMMUNICATION: 0.15,
    ENVIRONMENT: 0.2,
    SERVICES: 0.45,
};

/** Hyperlocal dimensions and mandatory weights (must sum to exactly 100%). */
export const HYPERLOCAL_DIMENSION_WEIGHTS: Record<
    | "SPATIAL_ACCESSIBILITY"
    | "FUNCTIONAL_AVAILABILITY"
    | "HALAL_ASSURANCE"
    | "ECOSYSTEM_CONNECTIVITY"
    | "EMBEDDEDNESS_CONTINUITY",
    number
> = {
    SPATIAL_ACCESSIBILITY: 0.3,
    FUNCTIONAL_AVAILABILITY: 0.25,
    HALAL_ASSURANCE: 0.2,
    ECOSYSTEM_CONNECTIVITY: 0.15,
    EMBEDDEDNESS_CONTINUITY: 0.1,
};

/** Evidence Confidence components and mandatory weights (must sum to exactly 100%). */
export const EVIDENCE_CONFIDENCE_WEIGHTS: Record<
    | "sourceReliability"
    | "documentEvidence"
    | "photoGeolocation"
    | "managementConfirmation"
    | "fieldValidation"
    | "dataFreshness",
    number
> = {
    sourceReliability: 0.15,
    documentEvidence: 0.2,
    photoGeolocation: 0.15,
    managementConfirmation: 0.1,
    fieldValidation: 0.25,
    dataFreshness: 0.15,
};

export const BASE_ACES_WEIGHT = 0.65;
export const BASE_HYPERLOCAL_WEIGHT = 0.35;

export const EVIDENCE_FACTOR_BASE = 0.7;
export const EVIDENCE_FACTOR_RANGE = 0.3;

/** Indicator value range (0–4). */
export const INDICATOR_MIN_VALUE = 0;
export const INDICATOR_MAX_VALUE = 4;
export const INDICATOR_TO_SCORE_MULTIPLIER = 25;

/** Canonical classification thresholds (inclusive lower bound). */
export const CLASSIFICATION_THRESHOLDS = [
    { min: 85, key: "SANGAT_SIAP", label: "Sangat siap" },
    { min: 70, key: "SIAP", label: "Siap" },
    { min: 55, key: "BERKEMBANG", label: "Berkembang" },
    { min: 40, key: "PERLU_PENGEMBANGAN", label: "Perlu pengembangan" },
    { min: 0, key: "BELUM_SIAP", label: "Belum siap" },
] as const;

export type AceshClassificationKey =
    | "BELUM_SIAP"
    | "PERLU_PENGEMBANGAN"
    | "BERKEMBANG"
    | "SIAP"
    | "SANGAT_SIAP";

/** Mapping of AceshIndicatorGroup to the dimension weight it belongs to. */
export const ACES_GROUPS: AceshIndicatorGroup[] = [
    "ACCESS",
    "COMMUNICATION",
    "ENVIRONMENT",
    "SERVICES",
];

export const HYPERLOCAL_GROUPS: AceshIndicatorGroup[] = [
    "SPATIAL_ACCESSIBILITY",
    "FUNCTIONAL_AVAILABILITY",
    "HALAL_ASSURANCE",
    "ECOSYSTEM_CONNECTIVITY",
    "EMBEDDEDNESS_CONTINUITY",
];

export const GROUP_LABELS: Record<AceshIndicatorGroup, string> = {
    ACCESS: "Access",
    COMMUNICATION: "Communication",
    ENVIRONMENT: "Environment",
    SERVICES: "Services",
    SPATIAL_ACCESSIBILITY: "Spatial accessibility",
    FUNCTIONAL_AVAILABILITY: "Functional availability",
    HALAL_ASSURANCE: "Halal assurance",
    ECOSYSTEM_CONNECTIVITY: "Ecosystem connectivity",
    EMBEDDEDNESS_CONTINUITY: "Embeddedness/continuity",
};

/** Default fallback reachability parameters (single source of truth). */
export const DEFAULT_REACHABILITY: Record<
    string,
    { maxDistanceMeters: number; maxTravelMinutes: number; travelMode: "WALKING" | "DRIVING" | "CYCLING" }
> = {
    MOSQUE: { maxDistanceMeters: 500, maxTravelMinutes: 10, travelMode: "WALKING" },
    MUSALA: { maxDistanceMeters: 500, maxTravelMinutes: 10, travelMode: "WALKING" },
    RESTAURANT: { maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    HALAL_FOOD: { maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    KULINER: { maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    LODGING: { maxDistanceMeters: 5000, maxTravelMinutes: 30, travelMode: "DRIVING" },
    PENGINAPAN: { maxDistanceMeters: 5000, maxTravelMinutes: 30, travelMode: "DRIVING" },
};

/** Fallback average speeds (km/h) used when routing engines are unavailable. */
export const TRAVEL_SPEED_KMH: Record<"WALKING" | "DRIVING" | "CYCLING", number> = {
    WALKING: 4.8,
    DRIVING: 40,
    CYCLING: 15,
};

export function sumWeights(weights: Record<string, number>): number {
    return Object.values(weights).reduce((sum, w) => sum + w, 0);
}

/**
 * Determines the default travel mode for a facility type:
 * places of worship default to WALKING, everything else to DRIVING.
 */
export function defaultTravelModeForType(
    facilityType: string | null | undefined,
): "WALKING" | "DRIVING" | "CYCLING" {
    const normalized = (facilityType ?? "").trim().toUpperCase();
    if (normalized.includes("MOSQUE") || normalized.includes("MUSALA") || normalized === "IBADAH") {
        return "WALKING";
    }
    return "DRIVING";
}
