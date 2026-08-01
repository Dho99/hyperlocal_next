import {
    INDICATOR_MAX_VALUE,
    INDICATOR_MIN_VALUE,
    INDICATOR_TO_SCORE_MULTIPLIER,
} from "./constants";

/** Rounds a number to exactly 1 decimal place. */
export function round1(value: number): number {
    return Math.round((value + Number.EPSILON) * 10) / 10;
}

/** Rounds a number to exactly 3 decimal places. */
export function round3(value: number): number {
    return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

/** Clamps a score into the 0–100 range. */
export function clampScore(value: number): number {
    return Math.min(100, Math.max(0, value));
}

/**
 * Converts an indicator value (0–4) into a 0–100 score:
 *   score = indicatorValue × 25
 */
export function toIndicatorScore(value: number): number {
    assertIndicatorValue(value);
    return value * INDICATOR_TO_SCORE_MULTIPLIER;
}

/** Validates that a value is an integer within the 0–4 range. */
export function assertIndicatorValue(value: number): void {
    if (!Number.isInteger(value)) {
        throw new Error(`Nilai indikator harus bilangan bulat, diterima: ${value}`);
    }
    if (value < INDICATOR_MIN_VALUE || value > INDICATOR_MAX_VALUE) {
        throw new Error(
            `Nilai indikator harus antara ${INDICATOR_MIN_VALUE}–${INDICATOR_MAX_VALUE}, diterima: ${value}`,
        );
    }
}

export interface GroupScoreInput {
    /** Indicator value 0–4. */
    value: number;
    /** Indicator weight within the group (normalized by the group's total weight). */
    weight: number;
}

/**
 * Computes the group score (0–100) as a weighted average of indicator scores:
 *   groupScore = Σ(weight × value × 25) / Σ(weight)
 * Falls back to 0 when no indicators are provided.
 */
export function calculateGroupScore(inputs: GroupScoreInput[]): number {
    if (inputs.length === 0) return 0;

    let weighted = 0;
    let totalWeight = 0;

    for (const input of inputs) {
        assertIndicatorValue(input.value);
        if (input.weight < 0) {
            throw new Error(`Bobot indikator tidak boleh negatif, diterima: ${input.weight}`);
        }
        weighted += input.weight * toIndicatorScore(input.value);
        totalWeight += input.weight;
    }

    if (totalWeight <= 0) return 0;
    return round1(weighted / totalWeight);
}
