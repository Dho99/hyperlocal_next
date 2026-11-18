import { describe, expect, it } from "vitest";
import {
    ACES_DIMENSION_WEIGHTS,
    BASE_ACES_WEIGHT,
    BASE_HYPERLOCAL_WEIGHT,
    EVIDENCE_CONFIDENCE_WEIGHTS,
    EVIDENCE_FACTOR_BASE,
    EVIDENCE_FACTOR_RANGE,
    HYPERLOCAL_DIMENSION_WEIGHTS,
} from "@/lib/services/acesh/constants";
import { calculateAceshScores } from "@/lib/services/acesh/acesh-scoring-service";
import {
    DEFAULT_SCORING_CONFIG,
    SCORING_CONFIG_GROUPS,
    assertScoringConfigTotals,
    sumScoringConfigGroup,
} from "@/lib/services/acesh/scoring-defaults";

describe("ACES-H scoring defaults (3 layers)", () => {
    it("totals 100% for every parameter group", () => {
        for (const group of SCORING_CONFIG_GROUPS) {
            expect(
                sumScoringConfigGroup(DEFAULT_SCORING_CONFIG, group.fields),
                group.label,
            ).toBe(100);
        }
    });

    it("derives percentages from the ratio constants (no drift)", () => {
        expect(DEFAULT_SCORING_CONFIG.version).toBe("ACES-H-1.0");

        expect(DEFAULT_SCORING_CONFIG.accessWeight).toBeCloseTo(ACES_DIMENSION_WEIGHTS.ACCESS * 100, 10);
        expect(DEFAULT_SCORING_CONFIG.servicesWeight).toBeCloseTo(ACES_DIMENSION_WEIGHTS.SERVICES * 100, 10);
        expect(DEFAULT_SCORING_CONFIG.spatialAccessibilityWeight).toBeCloseTo(
            HYPERLOCAL_DIMENSION_WEIGHTS.SPATIAL_ACCESSIBILITY * 100,
            10,
        );
        expect(DEFAULT_SCORING_CONFIG.embeddednessContinuityWeight).toBeCloseTo(
            HYPERLOCAL_DIMENSION_WEIGHTS.EMBEDDEDNESS_CONTINUITY * 100,
            10,
        );
        expect(DEFAULT_SCORING_CONFIG.fieldValidationWeight).toBeCloseTo(
            EVIDENCE_CONFIDENCE_WEIGHTS.fieldValidation * 100,
            10,
        );
        expect(DEFAULT_SCORING_CONFIG.dataFreshnessWeight).toBeCloseTo(
            EVIDENCE_CONFIDENCE_WEIGHTS.dataFreshness * 100,
            10,
        );
        expect(DEFAULT_SCORING_CONFIG.baseAcesWeight).toBeCloseTo(BASE_ACES_WEIGHT * 100, 10);
        expect(DEFAULT_SCORING_CONFIG.baseHyperlocalWeight).toBeCloseTo(BASE_HYPERLOCAL_WEIGHT * 100, 10);
        expect(DEFAULT_SCORING_CONFIG.evidenceFactorBase).toBeCloseTo(EVIDENCE_FACTOR_BASE * 100, 10);
        expect(DEFAULT_SCORING_CONFIG.evidenceFactorRange).toBeCloseTo(EVIDENCE_FACTOR_RANGE * 100, 10);
    });

    it("preserves the official 58.2 simulation", () => {
        const result = calculateAceshScores({
            acesScore: 66.8,
            hyperlocalScore: 59.5,
            evidenceConfidenceScore: 69,
        });

        expect(result.baseScore).toBe(64.2);
        expect(result.verifiedScore).toBe(58.2);
        expect(result.classification).toBe("BERKEMBANG");
    });

    it("rejects a configuration whose group total is not 100%", () => {
        expect(() =>
            assertScoringConfigTotals({ ...DEFAULT_SCORING_CONFIG, servicesWeight: 40 }),
        ).toThrow(/ACES Readiness/);
    });
});
