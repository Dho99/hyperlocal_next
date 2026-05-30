export interface WeightedFacility {
    facilityType: string | null;
    weight: number;
}

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

    const total = Array.from(typeMaxWeight.values()).reduce(
        (sum, w) => sum + w,
        0,
    );

    return Math.min(total, 100);
}
