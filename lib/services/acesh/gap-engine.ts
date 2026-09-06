import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import { round1 } from "./indicator";

export interface IndicatorWithScore {
    id: string;
    code: string;
    name: string;
    group: AceshIndicatorGroup;
    weight: number;
    value: number; // 0-4
}

export interface GroupGap {
    group: AceshIndicatorGroup;
    groupScore: number; // 0-100
    dimensionWeight: number; // 0-1
    gap: number; // 100 - groupScore
    gapWeighted: number; // gap * dimensionWeight
    baseImpact: number; // gapWeighted * baseWeight (0.65 or 0.35)
}

export function toScore(value: number): number {
    return value * 25;
}

export function gapForIndicator(value: number): number {
    return 100 - toScore(value);
}

export function calculateGroupGaps(
    indicators: IndicatorWithScore[],
    dimensionWeights: Record<string, number>,
    baseWeight: number, // 0.65 for ACES, 0.35 for Hyperlocal
): GroupGap[] {
    const byGroup = new Map<AceshIndicatorGroup, IndicatorWithScore[]>();
    for (const ind of indicators) {
        if (!byGroup.has(ind.group)) byGroup.set(ind.group, []);
        byGroup.get(ind.group)!.push(ind);
    }
    const gaps: GroupGap[] = [];
    for (const [group, list] of byGroup) {
        let weighted = 0, totalW = 0;
        for (const ind of list) {
            weighted += ind.weight * toScore(ind.value);
            totalW += ind.weight;
        }
        const groupScore = totalW ? round1(weighted / totalW) : 0;
        const gap = 100 - groupScore;
        const dimW = (dimensionWeights as Record<string, number>)[group] ?? 0;
        gaps.push({
            group,
            groupScore,
            dimensionWeight: dimW,
            gap,
            gapWeighted: gap * dimW,
            baseImpact: gap * dimW * baseWeight,
        });
    }
    return gaps.sort((a, b) => b.baseImpact - a.baseImpact);
}
