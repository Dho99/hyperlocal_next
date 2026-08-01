import { describe, expect, it } from "vitest";
import {
    calculateEvidenceConfidenceScore,
    calculateEvidenceFactor,
} from "@/lib/services/acesh/evidence-confidence-service";

const OFFICIAL_COMPONENTS = {
    sourceReliability: 70,
    documentEvidence: 75,
    photoGeolocation: 70,
    managementConfirmation: 65,
    fieldValidation: 70,
    dataFreshness: 60,
};

describe("Evidence Confidence scoring", () => {
    it("reproduces the official confidence score (69.0)", () => {
        expect(calculateEvidenceConfidenceScore(OFFICIAL_COMPONENTS)).toBe(69);
    });

    it("reproduces the official evidence factor (0.907)", () => {
        // the factor helper returns the raw value; the pipeline rounds to 3 dp
        expect(calculateEvidenceFactor(69)).toBeCloseTo(0.907, 3);
    });

    it("returns the minimum factor 0.70 at 0 confidence", () => {
        expect(calculateEvidenceFactor(0)).toBeCloseTo(0.7, 3);
    });

    it("returns the maximum factor 1.00 at 100 confidence", () => {
        expect(calculateEvidenceFactor(100)).toBeCloseTo(1, 3);
    });

    it("rejects out-of-range confidence inputs", () => {
        expect(() => calculateEvidenceFactor(150)).toThrow();
        expect(() => calculateEvidenceFactor(-10)).toThrow();
    });

    it("rejects NaN components", () => {
        expect(() =>
            calculateEvidenceConfidenceScore({ ...OFFICIAL_COMPONENTS, sourceReliability: Number.NaN }),
        ).toThrow();
    });

    it("rejects out-of-range components", () => {
        expect(() =>
            calculateEvidenceConfidenceScore({ ...OFFICIAL_COMPONENTS, fieldValidation: 101 }),
        ).toThrow();
    });
});
