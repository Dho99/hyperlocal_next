import { describe, expect, it } from "vitest";
import {
    calculateAcesDimensionScore,
    calculateAcesScore,
} from "@/lib/services/acesh/aces-readiness-service";
import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import type { GroupScoreInput } from "@/lib/services/acesh/indicator";

/** Official simulation: weights (0.40, 0.35, 0.25) and values per group. */
function officialGroups(): Record<AceshIndicatorGroup, GroupScoreInput[]> {
    return {
        ACCESS: [
            { value: 3, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 3, weight: 0.25 },
        ],
        COMMUNICATION: [
            { value: 2, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        ENVIRONMENT: [
            { value: 2, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ],
        SERVICES: [
            { value: 4, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 3, weight: 0.25 },
        ],
        SPATIAL_ACCESSIBILITY: [],
        FUNCTIONAL_AVAILABILITY: [],
        HALAL_ASSURANCE: [],
        ECOSYSTEM_CONNECTIVITY: [],
        EMBEDDEDNESS_CONTINUITY: [],
    };
}

describe("ACES Readiness scoring", () => {
    it("reproduces the official ACES dimension scores (rounded at group level)", () => {
        expect(calculateAcesDimensionScore("ACCESS", officialGroups().ACCESS)).toBe(75);
        expect(calculateAcesDimensionScore("COMMUNICATION", officialGroups().COMMUNICATION)).toBe(50);
        expect(calculateAcesDimensionScore("ENVIRONMENT", officialGroups().ENVIRONMENT)).toBe(50);
        expect(calculateAcesDimensionScore("SERVICES", officialGroups().SERVICES)).toBe(76.3);
    });

    it("reproduces the official ACES Readiness score (66.8)", () => {
        const score = calculateAcesScore(officialGroups());
        expect(score).toBe(66.8);
    });

    it("normalizes by total weight — equivalent single indicator per group", () => {
        const groups = officialGroups();
        groups.ACCESS = [{ value: 3, weight: 1 }];
        const score = calculateAcesScore(groups);
        expect(score).toBe(66.8);
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
        expect(calculateAcesScore(empty)).toBe(0);
    });
});
