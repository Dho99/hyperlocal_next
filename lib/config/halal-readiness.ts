export const FACILITY_WEIGHTS = {
    MOSQUE: 0.30,
    RESTAURANT: 0.40,
    TOILET: 0.20,
    GENERAL: 0.10,
} as const;

export type FacilityType = keyof typeof FACILITY_WEIGHTS;

export const FACILITY_TYPES: FacilityType[] = ["MOSQUE", "RESTAURANT", "TOILET", "GENERAL"];

export const FACILITY_LABELS: Record<FacilityType, string> = {
    MOSQUE: "Masjid / Mushola",
    RESTAURANT: "Restoran / Makanan Halal",
    TOILET: "Toilet / Tempat Wudhu",
    GENERAL: "Lingkungan Ramah Muslim",
};

export interface FacilityInput {
    type: FacilityType;
    name: string;
}

const MAX_SCORE = 100;

export function calculateHalalScore(facilities: FacilityInput[]): number {
    if (!facilities || facilities.length === 0) return 0;

    const typeSet = new Set(facilities.map((f) => f.type));
    let score = 0;

    for (const [type, weight] of Object.entries(FACILITY_WEIGHTS)) {
        if (typeSet.has(type as FacilityType)) {
            score += weight * MAX_SCORE;
        }
    }

    return Math.round(Math.min(score, MAX_SCORE));
}

export function getScoreColor(score: number): string {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
}

export function getScoreLabel(score: number): string {
    if (score >= 70) return "Sangat Siap";
    if (score >= 40) return "Cukup Siap";
    return "Perlu Peningkatan";
}
