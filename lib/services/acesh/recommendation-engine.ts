import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import { ACES_DIMENSION_WEIGHTS, HYPERLOCAL_DIMENSION_WEIGHTS } from "./constants";
import type { DestinationProfile, Recommendation, DestinationType } from "./recommendation-types";
import { DESTINATION_MULTIPLIERS, resolveDestinationType } from "./recommendation-types";
import { findRule } from "./recommendation-rules";

export interface EngineInput {
    indicator: { id: string; code: string; name: string; group: AceshIndicatorGroup; weight: number; value: number };
    dimensionWeight: number;
    groupScore: number;
    baseWeight: number; // 0.65 or 0.35
    evidenceConfidence: number; // 0-100
    profile?: DestinationProfile;
    // allow override
    feasibility?: number;
    visitorImpact?: number;
}

export function calculateRIS(input: EngineInput): { ris: number; priority: number; evidenceFactor: number; visitorImpact: number; feasibility: number; destinationMultiplier: number; reason: string[] } {
    const gap = 100 - input.indicator.value * 25;
    const gapSeverity = gap / 100;
    const evidenceConfidenceFactor = 0.5 + (input.evidenceConfidence / 200); // 0.5 - 1.0
    const destType: DestinationType = resolveDestinationType(input.profile);
    const destMult = (DESTINATION_MULTIPLIERS[destType] as Record<string, number>)[input.indicator.group] ?? 1;
    const rule = findRule(input.indicator.group);
    const feasibility = input.feasibility ?? rule?.defaultFeasibility ?? 0.7;
    const visitorImpact = input.visitorImpact ?? rule?.defaultVisitorImpact ?? 3;

    const ris = gapSeverity * input.indicator.weight * input.dimensionWeight * evidenceConfidenceFactor * visitorImpact * feasibility * destMult;
    // priority for ranking: RIS adjusted for baseWeight
    const priority = ris * input.baseWeight;

    const reason: string[] = [];
    if (gap >= 60) reason.push("gap_tinggi");
    if (input.dimensionWeight >= 0.3) reason.push("high_weight_dimension");
    if (visitorImpact >= 4) reason.push("high_user_need");
    if (input.evidenceConfidence < 60) reason.push("low_evidence_confidence");
    if (gapSeverity >= 0.5 && input.indicator.weight >= 0.3) reason.push("low_indicator_score");
    if (destMult > 1) reason.push("destination_profile_boost");

    return { ris, priority, evidenceFactor: evidenceConfidenceFactor, visitorImpact, feasibility, destinationMultiplier: destMult, reason };
}

export function classifyActionType(value: number, evidenceConfidence: number, freshnessLow: boolean): Recommendation["actionType"] {
    if (value >= 3 && evidenceConfidence < 60) return "VERIFY"; // score 75+, but evidence lemah
    if (value < 2) return "BUILD"; // <50
    if (value >= 2 && value < 3 && freshnessLow) return "IMPROVE"; // 50-75
    if (value >= 3) return "MAINTAIN";
    return "IMPROVE";
}

export function timelineFromFeasibility(feasibility: number, ris: number): Recommendation["timeline"] {
    if (feasibility >= 0.85 && ris >= 0.08) return "QUICK";
    if (feasibility <= 0.5) return "STRATEGIC";
    return "MEDIUM";
}
