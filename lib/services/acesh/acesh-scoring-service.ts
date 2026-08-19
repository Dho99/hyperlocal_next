import {
    clampScore,
    round1,
    round3,
} from "./indicator";
import { classifyScore, type AceshClassificationKey } from "./acesh-classification-service";
import { DEFAULT_SCORING_WEIGHTS, type AceshScoringWeights } from "./scoring-config-service";

export interface AceshScoringInput {
    acesScore: number;
    hyperlocalScore: number;
    evidenceConfidenceScore: number;
}

export interface AceshScoringResult {
    acesScore: number;
    hyperlocalScore: number;
    baseScore: number;
    evidenceConfidenceScore: number;
    evidenceFactor: number;
    verifiedScore: number;
    classification: AceshClassificationKey;
    classificationLabel: string;
}

/**
 * Central ACES-H scoring pipeline.
 *
 * Rounding policy (locked): every score is rounded to 1 decimal at each level —
 * the base score is computed from the ALREADY ROUNDED aces/hyperlocal scores,
 * and the verified score from the rounded base score. The evidence factor is
 * rounded to 3 decimals.
 */
export function calculateAceshScores(
    input: AceshScoringInput,
    weights: AceshScoringWeights = DEFAULT_SCORING_WEIGHTS,
): AceshScoringResult {
    const acesScore = round1(clampScore(input.acesScore));
    const hyperlocalScore = round1(clampScore(input.hyperlocalScore));

    // Base ACES-H Score: baseScore = (acesScore × 0.65) + (hyperlocalScore × 0.35)
    const baseScore = round1(
        clampScore(acesScore * weights.baseAces + hyperlocalScore * weights.baseHyperlocal),
    );

    const confidenceScore = round1(clampScore(input.evidenceConfidenceScore));

    // Evidence Factor: 0.70 + (0.30 × confidence / 100), range 0.70–1.00
    const evidenceFactor = round3(
        weights.evidenceFactorBase + weights.evidenceFactorRange * (confidenceScore / 100),
    );

    // Verified ACES-H Score: verifiedScore = baseScore × evidenceFactor
    const verifiedScore = round1(clampScore(baseScore * evidenceFactor));

    const classification = classifyScore(verifiedScore);

    return {
        acesScore,
        hyperlocalScore,
        baseScore,
        evidenceConfidenceScore: confidenceScore,
        evidenceFactor,
        verifiedScore,
        classification: classification.key,
        classificationLabel: classification.label,
    };
}
