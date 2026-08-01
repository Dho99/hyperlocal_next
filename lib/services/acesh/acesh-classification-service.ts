import {
    CLASSIFICATION_THRESHOLDS,
    type AceshClassificationKey,
} from "./constants";

export type { AceshClassificationKey };

/**
 * Five-level readiness classification:
 *   0–39.9    → BELUM_SIAP
 *   40–54.9   → PERLU_PENGEMBANGAN
 *   55–69.9   → BERKEMBANG
 *   70–84.9   → SIAP
 *   85–100    → SANGAT_SIAP
 */
export function classifyScore(score: number): {
    key: AceshClassificationKey;
    label: string;
} {
    if (Number.isNaN(score)) {
        throw new Error("Skor harus berupa angka");
    }
    const clamped = Math.min(100, Math.max(0, score));
    const match = CLASSIFICATION_THRESHOLDS.find((t) => clamped >= t.min);
    if (!match) {
        throw new Error(`Skor di luar rentang: ${score}`);
    }
    return { key: match.key, label: match.label };
}
