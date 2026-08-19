import { prisma } from "@/lib/prisma";
import {
    ACES_DIMENSION_WEIGHTS,
    BASE_ACES_WEIGHT,
    BASE_HYPERLOCAL_WEIGHT,
    EVIDENCE_CONFIDENCE_WEIGHTS,
    EVIDENCE_FACTOR_BASE,
    EVIDENCE_FACTOR_RANGE,
    HYPERLOCAL_DIMENSION_WEIGHTS,
} from "./constants";

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

export const DEFAULT_SCORING_WEIGHTS: AceshScoringWeights = {
    version: "ACES-H-1.0",
    aces: { ...ACES_DIMENSION_WEIGHTS },
    hyperlocal: { ...HYPERLOCAL_DIMENSION_WEIGHTS },
    evidence: { ...EVIDENCE_CONFIDENCE_WEIGHTS },
    baseAces: BASE_ACES_WEIGHT,
    baseHyperlocal: BASE_HYPERLOCAL_WEIGHT,
    evidenceFactorBase: EVIDENCE_FACTOR_BASE,
    evidenceFactorRange: EVIDENCE_FACTOR_RANGE,
};

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

/** Returns the active database configuration, or the official defaults before migration. */
export async function getActiveScoringWeights(): Promise<AceshScoringWeights> {
    try {
        const config = await prisma.aceshScoringConfig.findUnique({ where: { id: "default" } });
        return config ? storedConfigToWeights(config) : DEFAULT_SCORING_WEIGHTS;
    } catch {
        return DEFAULT_SCORING_WEIGHTS;
    }
}
