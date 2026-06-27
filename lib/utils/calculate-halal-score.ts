import {
    ACES_FACILITY_MAP,
    MAX_ACES_COVERAGE,
    type FacilityType,
} from "@/lib/config/halal-readiness";

export interface WeightedFacility {
    facilityType: string | null;
    weight: number;
}

/**
 * Score using per-facility quality weights (0–100) combined with GMTI ACES type weights.
 * contribution[type] = (max_quality_weight / 100) × ACES_weight[type]
 * score = Σ contributions / MAX_ACES_COVERAGE × 100
 */
export function calculateHalalScoreFromWeights(
    facilities: WeightedFacility[],
): number {
    if (facilities.length === 0) return 0;

    const typeMaxWeight = new Map<string, number>();

    for (const f of facilities) {
        const type = f.facilityType ?? "ADDITIONAL";
        const current = typeMaxWeight.get(type) ?? 0;
        typeMaxWeight.set(type, Math.max(current, f.weight));
    }

    let total = 0;
    for (const [type, maxQuality] of typeMaxWeight.entries()) {
        const acesCfg = ACES_FACILITY_MAP[type as FacilityType];
        if (acesCfg) {
            total += (maxQuality / 100) * acesCfg.weight;
        }
    }

    return Math.round(Math.min((total / MAX_ACES_COVERAGE) * 100, 100));
}
