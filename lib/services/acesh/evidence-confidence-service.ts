import {
    EVIDENCE_CONFIDENCE_WEIGHTS,
    sumWeights,
} from "./constants";
import { clampScore, round1 } from "./indicator";

export interface EvidenceConfidenceInput {
    sourceReliability: number;
    documentEvidence: number;
    photoGeolocation: number;
    managementConfirmation: number;
    fieldValidation: number;
    dataFreshness: number;
}

export interface EvidenceConfidenceBreakdown {
    sourceReliability: number;
    documentEvidence: number;
    photoGeolocation: number;
    managementConfirmation: number;
    fieldValidation: number;
    dataFreshness: number;
    total: number;
}

function assertScore(component: string, value: number): void {
    if (Number.isNaN(value)) {
        throw new Error(`Komponen evidence "${component}" harus berupa angka`);
    }
    if (value < 0 || value > 100) {
        throw new Error(
            `Komponen evidence "${component}" harus antara 0–100, diterima: ${value}`,
        );
    }
}

/**
 * Evidence Confidence Score (0–100):
 *   evidenceConfidenceScore = (sourceReliability × 0.15) + (documentEvidence × 0.20)
 *                           + (photoGeolocation × 0.15) + (managementConfirmation × 0.10)
 *                           + (fieldValidation × 0.25) + (dataFreshness × 0.15)
 */
export function calculateEvidenceConfidenceScore(
    input: EvidenceConfidenceInput,
    weights: typeof EVIDENCE_CONFIDENCE_WEIGHTS = EVIDENCE_CONFIDENCE_WEIGHTS,
): number {
    const weightSum = sumWeights(weights as Record<string, number>);

    for (const [component, value] of Object.entries(input)) {
        assertScore(component, value);
    }

    const weighted =
        input.sourceReliability * weights.sourceReliability +
        input.documentEvidence * weights.documentEvidence +
        input.photoGeolocation * weights.photoGeolocation +
        input.managementConfirmation * weights.managementConfirmation +
        input.fieldValidation * weights.fieldValidation +
        input.dataFreshness * weights.dataFreshness;

    const total = weightSum > 0 ? weighted / weightSum : 0;

    return clampScore(round1(total));
}

/**
 * Evidence Factor (0.70–1.00):
 *   evidenceFactor = 0.70 + (0.30 × evidenceConfidenceScore / 100)
 */
export function calculateEvidenceFactor(evidenceConfidenceScore: number): number {
    assertScore("evidenceConfidenceScore", evidenceConfidenceScore);

    const factor = 0.7 + 0.3 * (evidenceConfidenceScore / 100);
    return Math.min(1, Math.max(0.7, factor));
}
