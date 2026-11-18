import { prisma } from "@/lib/prisma";
import {
    ACES_DIMENSION_WEIGHTS,
    EVIDENCE_CONFIDENCE_WEIGHTS,
    HYPERLOCAL_DIMENSION_WEIGHTS,
} from "./constants";
import {
    DEFAULT_SCORING_CONFIG,
    type AceshScoringConfigValues,
} from "./scoring-defaults";

export interface AceshScoringWeights {
    version: string;
    aces: typeof ACES_DIMENSION_WEIGHTS;
    hyperlocal: typeof HYPERLOCAL_DIMENSION_WEIGHTS;
    evidence: typeof EVIDENCE_CONFIDENCE_WEIGHTS;
    baseAces: number;
    baseHyperlocal: number;
    evidenceFactorBase: number;
    evidenceFactorRange: number;
}

type StoredConfig = {
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
};

const ratio = (percentage: number) => percentage / 100;

export function storedConfigToWeights(config: StoredConfig): AceshScoringWeights {
    return {
        version: config.version,
        aces: {
            ACCESS: ratio(config.accessWeight),
            COMMUNICATION: ratio(config.communicationWeight),
            ENVIRONMENT: ratio(config.environmentWeight),
            SERVICES: ratio(config.servicesWeight),
        },
        hyperlocal: {
            SPATIAL_ACCESSIBILITY: ratio(config.spatialAccessibilityWeight),
            FUNCTIONAL_AVAILABILITY: ratio(config.functionalAvailabilityWeight),
            HALAL_ASSURANCE: ratio(config.halalAssuranceWeight),
            ECOSYSTEM_CONNECTIVITY: ratio(config.ecosystemConnectivityWeight),
            EMBEDDEDNESS_CONTINUITY: ratio(config.embeddednessContinuityWeight),
        },
        evidence: {
            sourceReliability: ratio(config.sourceReliabilityWeight),
            documentEvidence: ratio(config.documentEvidenceWeight),
            photoGeolocation: ratio(config.photoGeolocationWeight),
            managementConfirmation: ratio(config.managementConfirmationWeight),
            fieldValidation: ratio(config.fieldValidationWeight),
            dataFreshness: ratio(config.dataFreshnessWeight),
        },
        baseAces: ratio(config.baseAcesWeight),
        baseHyperlocal: ratio(config.baseHyperlocalWeight),
        evidenceFactorBase: ratio(config.evidenceFactorBase),
        evidenceFactorRange: ratio(config.evidenceFactorRange),
    };
}

export function storedConfigToConfigValues(config: StoredConfig): AceshScoringConfigValues {
    return {
        version: config.version,
        accessWeight: config.accessWeight,
        communicationWeight: config.communicationWeight,
        environmentWeight: config.environmentWeight,
        servicesWeight: config.servicesWeight,
        spatialAccessibilityWeight: config.spatialAccessibilityWeight,
        functionalAvailabilityWeight: config.functionalAvailabilityWeight,
        halalAssuranceWeight: config.halalAssuranceWeight,
        ecosystemConnectivityWeight: config.ecosystemConnectivityWeight,
        embeddednessContinuityWeight: config.embeddednessContinuityWeight,
        sourceReliabilityWeight: config.sourceReliabilityWeight,
        documentEvidenceWeight: config.documentEvidenceWeight,
        photoGeolocationWeight: config.photoGeolocationWeight,
        managementConfirmationWeight: config.managementConfirmationWeight,
        fieldValidationWeight: config.fieldValidationWeight,
        dataFreshnessWeight: config.dataFreshnessWeight,
        baseAcesWeight: config.baseAcesWeight,
        baseHyperlocalWeight: config.baseHyperlocalWeight,
        evidenceFactorBase: config.evidenceFactorBase,
        evidenceFactorRange: config.evidenceFactorRange,
    };
}

export const DEFAULT_SCORING_WEIGHTS: AceshScoringWeights =
    storedConfigToWeights(DEFAULT_SCORING_CONFIG);

export interface ActiveScoringConfig {
    config: AceshScoringConfigValues;
    weights: AceshScoringWeights;
}

/**
 * Returns the active database configuration plus its ratio weights, or the
 * official defaults before migration.
 */
export async function getActiveScoringConfig(): Promise<ActiveScoringConfig> {
    try {
        const stored = await prisma.aceshScoringConfig.findUnique({ where: { id: "default" } });
        if (!stored) return fallbackScoringConfig();
        return {
            config: storedConfigToConfigValues(stored),
            weights: storedConfigToWeights(stored),
        };
    } catch {
        return fallbackScoringConfig();
    }
}

/** Returns the active ratio weights, falling back to the official defaults. */
export async function getActiveScoringWeights(): Promise<AceshScoringWeights> {
    return (await getActiveScoringConfig()).weights;
}

function fallbackScoringConfig(): ActiveScoringConfig {
    return {
        config: { ...DEFAULT_SCORING_CONFIG },
        weights: DEFAULT_SCORING_WEIGHTS,
    };
}
