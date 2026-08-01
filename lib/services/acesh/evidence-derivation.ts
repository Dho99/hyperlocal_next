import type { EvidenceConfidenceInput } from "./evidence-confidence-service";

const FRESHNESS_BUCKETS: Array<{ maxAgeDays: number; score: number }> = [
    { maxAgeDays: 90, score: 100 },
    { maxAgeDays: 180, score: 75 },
    { maxAgeDays: 365, score: 50 },
    { maxAgeDays: Infinity, score: 25 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export interface EvidenceRecordLike {
    sourceReliabilityScore: number | null;
    documentUrl: string | null;
    photoUrl: string | null;
    latitude: unknown;
    longitude: unknown;
    managementConfirmed: boolean;
    fieldValidated: boolean;
    dataDate: Date | null;
    validatedAt: Date | null;
    createdAt: Date;
}

/**
 * Derives the six evidence confidence components (0–100) from evidence records.
 * Every component is the ratio (or average) across records:
 *   - sourceReliability:     average of sourceReliabilityScore
 *   - documentEvidence:      % records with a document URL
 *   - photoGeolocation:      % records with a photo URL AND coordinates
 *   - managementConfirmation:% records confirmed by management
 *   - fieldValidation:       % records validated in the field
 *   - dataFreshness:         average freshness bucket of the most recent date
 *                            (validatedAt ?? dataDate ?? createdAt)
 */
export function deriveEvidenceConfidence(
    records: EvidenceRecordLike[],
    now: Date = new Date(),
): EvidenceConfidenceInput {
    if (records.length === 0) {
        return {
            sourceReliability: 0,
            documentEvidence: 0,
            photoGeolocation: 0,
            managementConfirmation: 0,
            fieldValidation: 0,
            dataFreshness: 0,
        };
    }

    const sourceScores = records
        .map((r) => r.sourceReliabilityScore)
        .filter((s): s is number => s !== null && !Number.isNaN(s));

    const sourceReliability =
        sourceScores.length > 0
            ? sourceScores.reduce((sum, s) => sum + s, 0) / sourceScores.length
            : 0;

    const documentEvidence = percentage(records, (r) => Boolean(r.documentUrl));
    const photoGeolocation = percentage(
        records,
        (r) => Boolean(r.photoUrl) && r.latitude != null && r.longitude != null,
    );
    const managementConfirmation = percentage(records, (r) => r.managementConfirmed);
    const fieldValidation = percentage(records, (r) => r.fieldValidated);

    const freshnessScores = records.map((r) => {
        const reference = r.validatedAt ?? r.dataDate ?? r.createdAt;
        const ageDays = Math.max(0, (now.getTime() - reference.getTime()) / DAY_MS);
        const bucket = FRESHNESS_BUCKETS.find((b) => ageDays <= b.maxAgeDays);
        return (bucket ?? FRESHNESS_BUCKETS[FRESHNESS_BUCKETS.length - 1]).score;
    });
    const dataFreshness =
        freshnessScores.reduce((sum, s) => sum + s, 0) / freshnessScores.length;

    return {
        sourceReliability,
        documentEvidence,
        photoGeolocation,
        managementConfirmation,
        fieldValidation,
        dataFreshness,
    };
}

function percentage(records: EvidenceRecordLike[], predicate: (r: EvidenceRecordLike) => boolean): number {
    const count = records.filter(predicate).length;
    return (count / records.length) * 100;
}

/** Minimum confidence and record count required to mark an assessment VERIFIED. */
export const MIN_VERIFIED_CONFIDENCE = 60;
export const MIN_VERIFIED_RECORDS = 1;

export function shouldMarkVerified(
    confidenceScore: number,
    recordCount: number,
): boolean {
    return recordCount >= MIN_VERIFIED_RECORDS && confidenceScore >= MIN_VERIFIED_CONFIDENCE;
}
