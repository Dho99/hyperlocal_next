import { describe, expect, it } from "vitest";
import {
    assertIndicatorValue,
    calculateGroupScore,
    clampScore,
    round1,
    round3,
    toIndicatorScore,
} from "@/lib/services/acesh/indicator";

describe("indicator helpers", () => {
    it("rounds to exactly 1 decimal place", () => {
        expect(round1(66.8125)).toBe(66.8);
        expect(round1(58.229)).toBe(58.2);
        expect(round1(50)).toBe(50);
    });

    it("rounds to exactly 3 decimal places", () => {
        expect(round3(0.9069)).toBe(0.907);
        expect(round3(1)).toBe(1);
    });

    it("clamps scores into 0–100", () => {
        expect(clampScore(120)).toBe(100);
        expect(clampScore(-5)).toBe(0);
        expect(clampScore(64.2)).toBe(64.2);
    });

    it("converts indicator value (0–4) to a 0–100 score", () => {
        expect(toIndicatorScore(0)).toBe(0);
        expect(toIndicatorScore(2)).toBe(50);
        expect(toIndicatorScore(4)).toBe(100);
    });

    it("rejects non-integer and out-of-range indicator values", () => {
        expect(() => toIndicatorScore(2.5)).toThrow();
        expect(() => toIndicatorScore(5)).toThrow();
        expect(() => toIndicatorScore(-1)).toThrow();
        expect(() => assertIndicatorValue(3)).not.toThrow();
    });

    it("computes weighted group scores from the official simulation", () => {
        // SERVICES group: values (4,2,3) with weights (0.40, 0.35, 0.25)
        // → 76.25, rounded to 1 decimal per the rounding policy → 76.3
        const score = calculateGroupScore([
            { value: 4, weight: 0.4 },
            { value: 2, weight: 0.35 },
            { value: 3, weight: 0.25 },
        ]);
        expect(score).toBe(76.3);
    });

    it("computes other group scores from the official simulation", () => {
        const spatial = calculateGroupScore([
            { value: 3, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 2, weight: 0.25 },
        ]);
        expect(spatial).toBe(68.8);

        const embedded = calculateGroupScore([
            { value: 3, weight: 0.4 },
            { value: 3, weight: 0.35 },
            { value: 0, weight: 0.25 },
        ]);
        expect(embedded).toBe(56.3);
    });

    it("returns 0 for empty indicator groups", () => {
        expect(calculateGroupScore([])).toBe(0);
    });
});
