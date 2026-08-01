import { describe, expect, it } from "vitest";
import { calculateAceshScores } from "@/lib/services/acesh/acesh-scoring-service";

describe("ACES-H central scoring pipeline", () => {
    it("reproduces the official simulation end-to-end (58.2 → BERKEMBANG)", () => {
        const result = calculateAceshScores({
            acesScore: 66.8125,
            hyperlocalScore: 59.5,
            evidenceConfidenceScore: 69.0,
        });

        expect(result.acesScore).toBe(66.8);
        expect(result.hyperlocalScore).toBe(59.5);
        expect(result.baseScore).toBe(64.2);
        expect(result.evidenceConfidenceScore).toBe(69.0);
        expect(result.evidenceFactor).toBe(0.907);
        expect(result.verifiedScore).toBe(58.2);
        expect(result.classification).toBe("BERKEMBANG");
    });

    it("computes the base score from already-rounded aces/hyperlocal scores", () => {
        const result = calculateAceshScores({
            acesScore: 66.8125,
            hyperlocalScore: 59.5,
            evidenceConfidenceScore: 69.0,
        });
        // 0.65 × 66.8 + 0.35 × 59.5 = 64.245 → 64.2 (NOT 64.25 from raw 66.8125)
        expect(result.baseScore).toBe(64.2);
    });

    it("produces a verified score higher than base when confidence is 100", () => {
        const result = calculateAceshScores({
            acesScore: 80,
            hyperlocalScore: 70,
            evidenceConfidenceScore: 100,
        });
        expect(result.evidenceFactor).toBe(1);
        expect(result.verifiedScore).toBe(result.baseScore);
    });

    it("clamps input scores into 0–100", () => {
        const result = calculateAceshScores({
            acesScore: 150,
            hyperlocalScore: -20,
            evidenceConfidenceScore: 500,
        });
        expect(result.acesScore).toBe(100);
        expect(result.hyperlocalScore).toBe(0);
        expect(result.evidenceConfidenceScore).toBe(100);
    });
});
