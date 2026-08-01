import { describe, expect, it } from "vitest";
import {
    calculateHyperlocalDimensionScore,
    calculateHyperlocalScore,
} from "@/lib/services/acesh/hyperlocal-scoring-service";
import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import type { GroupScoreInput } from "@/lib/services/acesh/indicator";

function officialGroups(): Record<AceshIndicatorGroup, GroupScoreInput[]> {
    return {
        ACCESS: [],
        COMMUNICATION: [],
        ENVIRONMENT: [],
        SERVICES: [],
        SPATIAL_ACCESSIBILITY: [
            { value: 3, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        FUNCTIONAL_AVAILABILITY: [
            { value: 2, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        HALAL_ASSURANCE: [
            { value: 2, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        ECOSYSTEM_CONNECTIVITY: [
            { value: 3, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        EMBEDDEDNESS_CONTINUITY: [
            { value: 3, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 0, weight: 0.25 },
        ],
    };
}

describe("Hyperlocal scoring", () => {
    it("reproduces the official Hyperlocal dimension scores (rounded at group level)", () => {
        expect(calculateHyperlocalDimensionScore("SPATIAL_ACCESSIBILITY", officialGroups().SPATIAL_ACCESSIBILITY)).toBe(68.8);
        expect(calculateHyperlocalDimensionScore("FUNCTIONAL_AVAILABILITY", officialGroups().FUNCTIONAL_AVAILABILITY)).toBe(50);
        expect(calculateHyperlocalDimensionScore("HALAL_ASSURANCE", officialGroups().HALAL_ASSURANCE)).toBe(58.8);
        expect(calculateHyperlocalDimensionScore("ECOSYSTEM_CONNECTIVITY", officialGroups().ECOSYSTEM_CONNECTIVITY)).toBe(60);
        expect(calculateHyperlocalDimensionScore("EMBEDDEDNESS_CONTINUITY", officialGroups().EMBEDDEDNESS_CONTINUITY)).toBe(56.3);
    });

    it("reproduces the official Hyperlocal score (59.5)", () => {
        const score = calculateHyperlocalScore(officialGroups());
        expect(score).toBe(59.5);
    });

    it("returns 0 when no indicators are scored", () => {
        const empty: Record<AceshIndicatorGroup, GroupScoreInput[]> = {
            ACCESS: [],
            COMMUNICATION: [],
            ENVIRONMENT: [],
            SERVICES: [],
            SPATIAL_ACCESSIBILITY: [],
            FUNCTIONAL_AVAILABILITY: [],
            HALAL_ASSURANCE: [],
            ECOSYSTEM_CONNECTIVITY: [],
            EMBEDDEDNESS_CONTINUITY: [],
        };
        expect(calculateHyperlocalScore(empty)).toBe(0);
    });
});
