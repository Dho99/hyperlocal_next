import type { AceshIndicatorGroup } from "@/lib/generated/prisma";

export type RecommendationActionType = "BUILD" | "IMPROVE" | "VERIFY" | "MAINTAIN";
export type RecommendationTimeline = "QUICK" | "MEDIUM" | "STRATEGIC";
export type RecommendationStatus = "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "VALIDATING" | "VERIFIED";

export interface RecommendationRule {
    id: string;
    indicatorGroup: AceshIndicatorGroup | "EVIDENCE";
    actionType: RecommendationActionType;
    prerequisite?: string[];
    title: string;
    description: string;
    timeline: RecommendationTimeline;
    defaultFeasibility: number; // 0.2-1
    defaultVisitorImpact: number; // 1-5
}

export interface Recommendation {
    id: string;
    indicatorId?: string;
    indicatorCode?: string;
    indicatorName?: string;
    group: AceshIndicatorGroup | "EVIDENCE";
    actionType: RecommendationActionType;
    timeline: RecommendationTimeline;
    title: string;
    description: string;
    gap: number; // 0-100
    gapSeverity: number; // 0-1
    weight: number;
    dimensionWeight: number;
    ris: number; // Recommendation Impact Score
    priorityScore: number;
    reason: string[];
    explain: string;
    prerequisite?: string[];
    status?: RecommendationStatus;
    // before-after simulation
    currentScore: number | null;
    targetScore: number;
    estimatedBaseIncrease?: number;
    estimatedVerifiedIncrease?: number;
    estimatedNewVerified?: number;
    // destination context
    destinationType?: string;
}

export interface DestinationProfile {
    slug?: string;
    categoryName?: string;
    city?: string;
}

export type DestinationType = "Nature" | "Heritage" | "Shopping" | "Religious" | "Beach" | "Urban" | "General";

export const DESTINATION_MULTIPLIERS: Record<DestinationType, Record<string, number>> = {
    Nature: { SERVICES: 1.2, ENVIRONMENT: 1.3, ACCESS: 1.1 },
    Heritage: { SERVICES: 1.0, COMMUNICATION: 1.4, ENVIRONMENT: 1.2 },
    Shopping: { SERVICES: 1.4, ECOSYSTEM_CONNECTIVITY: 1.3 },
    Religious: { HALAL_ASSURANCE: 1.5, SERVICES: 1.2 },
    Beach: { ENVIRONMENT: 1.4, SERVICES: 1.3, ACCESS: 1.2 },
    Urban: { SPATIAL_ACCESSIBILITY: 1.3, COMMUNICATION: 1.2 },
    General: {},
};

export function resolveDestinationType(profile?: DestinationProfile): DestinationType {
    const hay = `${profile?.categoryName ?? ""} ${profile?.slug ?? ""}`.toLowerCase();
    if (hay.includes("alam") || hay.includes("nature") || hay.includes("pantai") || hay.includes("beach")) return "Beach";
    if (hay.includes("religi") || hay.includes("masjid") || hay.includes("religious")) return "Religious";
    if (hay.includes("heritage") || hay.includes("budaya") || hay.includes("sejarah")) return "Heritage";
    if (hay.includes("belanja") || hay.includes("shopping") || hay.includes("pasar")) return "Shopping";
    return "General";
}
