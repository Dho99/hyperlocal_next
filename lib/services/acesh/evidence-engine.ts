import type { EvidenceRecordLike } from "./evidence-derivation";
import { deriveEvidenceConfidence } from "./evidence-derivation";
import { calculateEvidenceConfidenceScore } from "./evidence-confidence-service";

export interface EvidenceGap {
    component: string;
    label: string;
    value: number; // 0-100
    gap: number; // 100 - value
    weight: number;
    priority: number; // gap * weight
}

export function calculateEvidenceGaps(records: EvidenceRecordLike[], now = new Date()): { gaps: EvidenceGap[]; evc: number; derived: ReturnType<typeof deriveEvidenceConfidence> } {
    const derived = deriveEvidenceConfidence(records, now);
    const evc = calculateEvidenceConfidenceScore(derived);
    const weights: Record<string, number> = {
        sourceReliability: 0.15,
        documentEvidence: 0.2,
        photoGeolocation: 0.15,
        managementConfirmation: 0.1,
        fieldValidation: 0.25,
        dataFreshness: 0.15,
    };
    const labels: Record<string, string> = {
        sourceReliability: "Source Reliability",
        documentEvidence: "Document Evidence",
        photoGeolocation: "Photo & Geolocation",
        managementConfirmation: "Management Confirmation",
        fieldValidation: "Field Validation",
        dataFreshness: "Data Freshness",
    };
    const gaps: EvidenceGap[] = Object.entries(weights).map(([k, w]) => {
        const v = (derived as unknown as Record<string, number>)[k] ?? 0;
        return {
            component: k,
            label: labels[k] ?? k,
            value: v,
            gap: 100 - v,
            weight: w,
            priority: (100 - v) * w,
        };
    });
    gaps.sort((a, b) => b.priority - a.priority);
    return { gaps, evc, derived };
}
