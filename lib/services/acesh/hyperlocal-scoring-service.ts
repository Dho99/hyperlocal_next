import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import {
    HYPERLOCAL_DIMENSION_WEIGHTS,
    HYPERLOCAL_GROUPS,
    sumWeights,
} from "./constants";
import { calculateGroupScore, clampScore, round1, type GroupScoreInput } from "./indicator";

export type HyperlocalGroupKey = keyof typeof HYPERLOCAL_DIMENSION_WEIGHTS;

/**
 * Hyperlocal Score (0–100):
 *   hyperlocalScore = (spatialAccessibility × 0.30) + (functionalAvailability × 0.25)
 *                   + (halalAssurance × 0.20) + (ecosystemConnectivity × 0.15)
 *                   + (embeddednessContinuity × 0.10)
 *
 * Each dimension score is the weighted average of its indicator scores (0–100).
 */
export function calculateHyperlocalScore(
    scoresByGroup: Record<AceshIndicatorGroup, GroupScoreInput[]>,
): number {
    const weights = HYPERLOCAL_DIMENSION_WEIGHTS;
    const weightSum = sumWeights(weights as Record<string, number>);

    let total = 0;
    for (const group of HYPERLOCAL_GROUPS) {
        const dimension = group as HyperlocalGroupKey;
        const groupScore = calculateGroupScore(scoresByGroup[group] ?? []);
        total += groupScore * weights[dimension];
    }

    if (weightSum > 0) {
        total = total / weightSum;
    }

    return clampScore(round1(total));
}

/** Computes a single Hyperlocal dimension score (0–100) from its indicators. */
export function calculateHyperlocalDimensionScore(
    group: AceshIndicatorGroup,
    inputs: GroupScoreInput[],
): number {
    return calculateGroupScore(inputs);
}
