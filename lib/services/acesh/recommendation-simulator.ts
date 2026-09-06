import { round1, round3, clampScore } from "./indicator";
import { BASE_ACES_WEIGHT, BASE_HYPERLOCAL_WEIGHT, EVIDENCE_FACTOR_BASE, EVIDENCE_FACTOR_RANGE } from "./constants";

export interface SimInput {
    currentAces: number;
    currentHyperlocal: number;
    currentEvc: number;
    // which group indicator belongs to and its contribution
    group: string;
    dimensionWeight: number;
    indicatorWeight: number;
    sumWeightsGroup: number;
    currentValue: number; // 0-4
    targetValue: number; // 0-4
    baseWeight: number; // 0.65 or 0.35
}

export interface SimResult {
    currentScore: number;
    targetScore: number;
    groupScoreBefore: number;
    groupScoreAfter: number;
    acesAfter: number;
    hyperlocalAfter: number;
    baseBefore: number;
    baseAfter: number;
    baseIncrease: number;
    factorBefore: number;
    factorAfter: number;
    verifiedBefore: number;
    verifiedAfter: number;
    verifiedIncrease: number;
    estimatedNewVerified: number;
}

export function simulateImprovement(input: SimInput): SimResult {
    const toScore = (v: number) => v * 25;
    const currentScore = toScore(input.currentValue);
    const targetScore = toScore(input.targetValue);
    // group score delta: (weight * delta)/sumWeights
    const delta = (input.indicatorWeight * (targetScore - currentScore)) / (input.sumWeightsGroup || 1);
    // assume groupScore before derived, we approximate via current group contribution
    // For simulation, we compute new aces/hyperlocal as old + delta*dimensionWeight? Actually groupScore after = before + delta
    // We need groupScore before: we don't have, so we estimate baseBefore already, and baseAfter = baseBefore + delta * dimensionWeight * baseWeight
    // Simpler: compute baseAfter directly
    const baseBefore = round1(clampScore(input.currentAces * BASE_ACES_WEIGHT + input.currentHyperlocal * BASE_HYPERLOCAL_WEIGHT));
    // new group scores
    let acesAfter = input.currentAces;
    let hyperAfter = input.currentHyperlocal;
    if (input.baseWeight === BASE_ACES_WEIGHT) {
        // ACES group
        // delta is already weighted within group, need to apply dimensionWeight
        // groupScoreAfter = groupScoreBefore + delta
        // acesAfter = acesBefore + delta * dimensionWeight
        acesAfter = round1(clampScore(input.currentAces + delta * input.dimensionWeight));
    } else {
        hyperAfter = round1(clampScore(input.currentHyperlocal + delta * input.dimensionWeight));
    }
    const baseAfter = round1(clampScore(acesAfter * BASE_ACES_WEIGHT + hyperAfter * BASE_HYPERLOCAL_WEIGHT));
    const baseIncrease = round1(baseAfter - baseBefore);
    const factorBefore = round3(EVIDENCE_FACTOR_BASE + EVIDENCE_FACTOR_RANGE * (input.currentEvc / 100));
    const factorAfter = factorBefore; // unless EVC also improves, keep same for pure indicator sim
    const verifiedBefore = round1(clampScore(baseBefore * factorBefore));
    const verifiedAfter = round1(clampScore(baseAfter * factorAfter));
    const verifiedIncrease = round1(verifiedAfter - verifiedBefore);
    return {
        currentScore,
        targetScore,
        groupScoreBefore: 0, // placeholder, caller can fill if known
        groupScoreAfter: 0,
        acesAfter,
        hyperlocalAfter: hyperAfter,
        baseBefore,
        baseAfter,
        baseIncrease,
        factorBefore,
        factorAfter,
        verifiedBefore,
        verifiedAfter,
        verifiedIncrease,
        estimatedNewVerified: verifiedAfter,
    };
}

export function simulateEvidenceImprovement(currentEvc: number, targetEvc: number, baseScore: number): { factorBefore: number; factorAfter: number; verifiedBefore: number; verifiedAfter: number; verifiedIncrease: number } {
    const factorBefore = round3(EVIDENCE_FACTOR_BASE + EVIDENCE_FACTOR_RANGE * (currentEvc / 100));
    const factorAfter = round3(EVIDENCE_FACTOR_BASE + EVIDENCE_FACTOR_RANGE * (targetEvc / 100));
    const verifiedBefore = round1(clampScore(baseScore * factorBefore));
    const verifiedAfter = round1(clampScore(baseScore * factorAfter));
    return { factorBefore, factorAfter, verifiedBefore, verifiedAfter, verifiedIncrease: round1(verifiedAfter - verifiedBefore) };
}
