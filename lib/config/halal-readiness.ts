export const FACILITY_WEIGHTS = {
    MOSQUE: 0.30,
    RESTAURANT: 0.40,
    ACCESSIBILITY: 0.10,
    FAMILY: 0.10,
    CLEANLINESS: 0.05,
    ADDITIONAL: 0.05,
} as const;

export type FacilityType = keyof typeof FACILITY_WEIGHTS;

export const FACILITY_TYPES: FacilityType[] = [
    "MOSQUE",
    "RESTAURANT",
    "ACCESSIBILITY",
    "FAMILY",
    "CLEANLINESS",
    "ADDITIONAL",
];

export const FACILITY_LABELS: Record<FacilityType, string> = {
    MOSQUE: "Ketersediaan Musala",
    RESTAURANT: "Ketersediaan Makanan Halal",
    ACCESSIBILITY: "Aksesibilitas",
    FAMILY: "Fasilitas Keluarga",
    CLEANLINESS: "Kebersihan",
    ADDITIONAL: "Indikator Tambahan",
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
    if (score > 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
}

export function getScoreLabel(score: number): string {
    if (score > 80) return "Sangat Siap";
    if (score >= 60) return "Siap";
    if (score >= 40) return "Cukup Siap";
    return "Perlu Pengembangan";
}
