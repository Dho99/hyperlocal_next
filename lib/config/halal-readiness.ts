export type FacilityType =
    | "MOSQUE"
    | "RESTAURANT"
    | "FAMILY"
    | "ACCESSIBILITY"
    | "CLEANLINESS"
    | "ADDITIONAL";

export type AcesPillar = "S" | "A" | "E" | "C";

export interface AcesFacilityConfig {
    pillar: AcesPillar;
    pillarLabel: string;
    pillarWeight: number;
    subcategory: string;
    weight: number;
}

/** GMTI ACES sub-category mapping for each facility type */
export const ACES_FACILITY_MAP: Record<FacilityType, AcesFacilityConfig> = {
    MOSQUE: {
        pillar: "S",
        pillarLabel: "Services",
        pillarWeight: 0.40,
        subcategory: "Prayer Places",
        weight: 0.10,
    },
    RESTAURANT: {
        pillar: "S",
        pillarLabel: "Services",
        pillarWeight: 0.40,
        subcategory: "Halal Dining",
        weight: 0.10,
    },
    FAMILY: {
        pillar: "S",
        pillarLabel: "Services",
        pillarWeight: 0.40,
        subcategory: "Heritage & Experiences",
        weight: 0.05,
    },
    ACCESSIBILITY: {
        pillar: "A",
        pillarLabel: "Access",
        pillarWeight: 0.15,
        subcategory: "Transport Infrastructure",
        weight: 0.05,
    },
    CLEANLINESS: {
        pillar: "E",
        pillarLabel: "Environment",
        pillarWeight: 0.30,
        subcategory: "Sustainability",
        weight: 0.05,
    },
    ADDITIONAL: {
        pillar: "E",
        pillarLabel: "Environment",
        pillarWeight: 0.30,
        subcategory: "General Safety",
        weight: 0.10,
    },
};

/** ACES pillar display order */
export const ACES_PILLAR_ORDER: AcesPillar[] = ["S", "A", "E", "C"];

export const ACES_PILLAR_LABELS: Record<AcesPillar, string> = {
    S: "Services",
    A: "Access",
    E: "Environment",
    C: "Communications",
};

export const ACES_PILLAR_WEIGHTS: Record<AcesPillar, number> = {
    S: 0.40,
    A: 0.15,
    E: 0.30,
    C: 0.15,
};

export const FACILITY_TYPES: FacilityType[] = [
    "MOSQUE",
    "RESTAURANT",
    "FAMILY",
    "ACCESSIBILITY",
    "CLEANLINESS",
    "ADDITIONAL",
];

/** Sub-category labels per facility type (GMTI ACES names) */
export const FACILITY_LABELS: Record<FacilityType, string> = {
    MOSQUE: "Prayer Places",
    RESTAURANT: "Halal Dining",
    FAMILY: "Heritage & Experiences",
    ACCESSIBILITY: "Transport Infrastructure",
    CLEANLINESS: "Sustainability",
    ADDITIONAL: "General Safety",
};

/** Raw ACES weights per facility type (backward-compat alias) */
export const FACILITY_WEIGHTS: Record<FacilityType, number> = Object.fromEntries(
    Object.entries(ACES_FACILITY_MAP).map(([k, v]) => [k, v.weight]),
) as Record<FacilityType, number>;

/**
 * Sum of ACES sub-category weights covered by the 6 facility types.
 * Used to normalize the score to 0–100.
 */
export const MAX_ACES_COVERAGE = Object.values(ACES_FACILITY_MAP).reduce(
    (sum, cfg) => sum + cfg.weight,
    0,
); // 0.45

export interface FacilityInput {
    type: FacilityType;
    name: string;
}

/** Score based on GMTI ACES weights, normalized to 0–100. */
export function calculateHalalScore(facilities: FacilityInput[]): number {
    if (!facilities || facilities.length === 0) return 0;

    const typeSet = new Set(facilities.map((f) => f.type));
    let raw = 0;

    for (const [type, cfg] of Object.entries(ACES_FACILITY_MAP)) {
        if (typeSet.has(type as FacilityType)) {
            raw += cfg.weight;
        }
    }

    return Math.round(Math.min((raw / MAX_ACES_COVERAGE) * 100, 100));
}

export function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return "Sangat Siap";
    if (score >= 60) return "Siap dengan Catatan";
    if (score >= 40) return "Perlu Pengembangan";
    return "Belum Siap";
}
