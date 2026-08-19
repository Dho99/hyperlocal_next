import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import {
    ACES_DIMENSION_WEIGHTS,
    ACES_GROUPS,
    sumWeights,
} from "./constants";
import { calculateGroupScore, clampScore, round1, type GroupScoreInput } from "./indicator";

export type AcesGroupKey = keyof typeof ACES_DIMENSION_WEIGHTS;

/**
 * ACES Readiness Score (0–100):
 *   acesScore = (accessScore × 0.20) + (communicationScore × 0.15)
 *             + (environmentScore × 0.20) + (servicesScore × 0.45)
 *
 * Each dimension score is the weighted average of its indicator scores (0–100).
 */
export function calculateAcesScore(
    scoresByGroup: Record<AceshIndicatorGroup, GroupScoreInput[]>,
    weights: typeof ACES_DIMENSION_WEIGHTS = ACES_DIMENSION_WEIGHTS,
): number {
    const weightSum = sumWeights(weights as Record<string, number>);

    let total = 0;
    for (const group of ACES_GROUPS) {
        const dimension = group as AcesGroupKey;
        const groupScore = calculateGroupScore(scoresByGroup[group] ?? []);
        total += groupScore * weights[dimension];
    }

    if (weightSum > 0) {
        total = total / weightSum;
    }

    return clampScore(round1(total));
}

/** Computes a single ACES dimension score (0–100) from its indicators. */
export function calculateAcesDimensionScore(
    group: AceshIndicatorGroup,
    inputs: GroupScoreInput[],
): number {
    return calculateGroupScore(inputs);
}
