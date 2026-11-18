import {
    ACES_DIMENSION_WEIGHTS,
    BASE_ACES_WEIGHT,
    BASE_HYPERLOCAL_WEIGHT,
    EVIDENCE_CONFIDENCE_WEIGHTS,
    EVIDENCE_FACTOR_BASE,
    EVIDENCE_FACTOR_RANGE,
    HYPERLOCAL_DIMENSION_WEIGHTS,
} from "./constants";

/**
 * Database shape of the ACES-H scoring configuration.
 * Percentages are stored as 0-100 values (matching the admin settings UI).
 */
export interface AceshScoringConfigValues {
    version: string;
    accessWeight: number;
    communicationWeight: number;
    environmentWeight: number;
    servicesWeight: number;
    spatialAccessibilityWeight: number;
    functionalAvailabilityWeight: number;
    halalAssuranceWeight: number;
    ecosystemConnectivityWeight: number;
    embeddednessContinuityWeight: number;
    sourceReliabilityWeight: number;
    documentEvidenceWeight: number;
    photoGeolocationWeight: number;
    managementConfirmationWeight: number;
    fieldValidationWeight: number;
    dataFreshnessWeight: number;
    baseAcesWeight: number;
    baseHyperlocalWeight: number;
    evidenceFactorBase: number;
    evidenceFactorRange: number;
}

export type ScoringConfigNumericKey = Exclude<keyof AceshScoringConfigValues, "version">;

const percent = (ratio: number) => Math.round(ratio * 1000) / 10;

/**
 * Canonical ACES-H 1.0 defaults, derived from the ratio constants so the
 * seed, the database fallback, and the admin reset button can never drift.
 */
export const DEFAULT_SCORING_CONFIG: AceshScoringConfigValues = {
    version: "ACES-H-1.0",
    accessWeight: percent(ACES_DIMENSION_WEIGHTS.ACCESS),
    communicationWeight: percent(ACES_DIMENSION_WEIGHTS.COMMUNICATION),
    environmentWeight: percent(ACES_DIMENSION_WEIGHTS.ENVIRONMENT),
    servicesWeight: percent(ACES_DIMENSION_WEIGHTS.SERVICES),
    spatialAccessibilityWeight: percent(HYPERLOCAL_DIMENSION_WEIGHTS.SPATIAL_ACCESSIBILITY),
    functionalAvailabilityWeight: percent(HYPERLOCAL_DIMENSION_WEIGHTS.FUNCTIONAL_AVAILABILITY),
    halalAssuranceWeight: percent(HYPERLOCAL_DIMENSION_WEIGHTS.HALAL_ASSURANCE),
    ecosystemConnectivityWeight: percent(HYPERLOCAL_DIMENSION_WEIGHTS.ECOSYSTEM_CONNECTIVITY),
    embeddednessContinuityWeight: percent(HYPERLOCAL_DIMENSION_WEIGHTS.EMBEDDEDNESS_CONTINUITY),
    sourceReliabilityWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.sourceReliability),
    documentEvidenceWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.documentEvidence),
    photoGeolocationWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.photoGeolocation),
    managementConfirmationWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.managementConfirmation),
    fieldValidationWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.fieldValidation),
    dataFreshnessWeight: percent(EVIDENCE_CONFIDENCE_WEIGHTS.dataFreshness),
    baseAcesWeight: percent(BASE_ACES_WEIGHT),
    baseHyperlocalWeight: percent(BASE_HYPERLOCAL_WEIGHT),
    evidenceFactorBase: percent(EVIDENCE_FACTOR_BASE),
    evidenceFactorRange: percent(EVIDENCE_FACTOR_RANGE),
};

export interface ScoringConfigGroup {
    key: "aces" | "hyperlocal" | "evidence" | "base" | "factor";
    label: string;
    fields: ScoringConfigNumericKey[];
}

/** The three scoring layers plus the two composition groups, in DB order. */
export const SCORING_CONFIG_GROUPS: ScoringConfigGroup[] = [
    {
        key: "aces",
        label: "ACES Readiness",
        fields: [
            "accessWeight",
            "communicationWeight",
            "environmentWeight",
            "servicesWeight",
        ],
    },
    {
        key: "hyperlocal",
        label: "Hyperlocal Halal Ecosystem",
        fields: [
            "spatialAccessibilityWeight",
            "functionalAvailabilityWeight",
            "halalAssuranceWeight",
            "ecosystemConnectivityWeight",
            "embeddednessContinuityWeight",
        ],
    },
    {
        key: "evidence",
        label: "Evidence Confidence",
        fields: [
            "sourceReliabilityWeight",
            "documentEvidenceWeight",
            "photoGeolocationWeight",
            "managementConfirmationWeight",
            "fieldValidationWeight",
            "dataFreshnessWeight",
        ],
    },
    {
        key: "base",
        label: "Komposisi Base ACES-H",
        fields: ["baseAcesWeight", "baseHyperlocalWeight"],
    },
    {
        key: "factor",
        label: "Evidence Factor",
        fields: ["evidenceFactorBase", "evidenceFactorRange"],
    },
];

export function sumScoringConfigGroup(
    config: AceshScoringConfigValues,
    fields: ScoringConfigNumericKey[],
): number {
    return fields.reduce((sum, field) => sum + config[field], 0);
}

/** Throws when any weight group does not total exactly 100%. */
export function assertScoringConfigTotals(config: AceshScoringConfigValues): void {
    for (const group of SCORING_CONFIG_GROUPS) {
        const total = sumScoringConfigGroup(config, group.fields);
        if (Math.abs(total - 100) > 0.001) {
            throw new Error(`${group.label} harus berjumlah 100% (saat ini ${total}%).`);
        }
    }
}
