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

const EVIDENCE_COMPONENT_KEYS = [
    "sourceReliability",
    "documentEvidence",
    "photoGeolocation",
    "managementConfirmation",
    "fieldValidation",
    "dataFreshness",
] as const;

type EvidenceComponentKey = (typeof EVIDENCE_COMPONENT_KEYS)[number];

export interface SurveyEvidenceLike {
    scores: unknown;
}

export interface CommunityEvidence {
    /** Only components that at least one visitor actually filled (> 0). */
    components: Partial<EvidenceConfidenceInput>;
    /** Number of responses that contributed at least one non-zero component. */
    responseCount: number;
}

export type EvidenceSource = "OFFICIAL" | "COMMUNITY" | "BLENDED" | "NONE";

export interface MergedEvidenceConfidence {
    input: EvidenceConfidenceInput;
    communityWeight: number;
    source: EvidenceSource;
}

const round1 = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

/**
 * Aggregates the evidence self-ratings submitted through the public survey.
 * Responses whose evidence components are all zero are ignored: the survey
 * form initialises every component to 0, so an untouched layer would otherwise
 * drag the official confidence down.
 */
export function deriveCommunityEvidence(
    surveys: SurveyEvidenceLike[],
): CommunityEvidence | null {
    const sums: Record<EvidenceComponentKey, number> = {
        sourceReliability: 0,
        documentEvidence: 0,
        photoGeolocation: 0,
        managementConfirmation: 0,
        fieldValidation: 0,
        dataFreshness: 0,
    };
    const counts: Record<EvidenceComponentKey, number> = {
        sourceReliability: 0,
        documentEvidence: 0,
        photoGeolocation: 0,
        managementConfirmation: 0,
        fieldValidation: 0,
        dataFreshness: 0,
    };

    let responseCount = 0;

    for (const survey of surveys) {
        const payload = survey.scores as {
            evidence?: Record<string, unknown>;
        } | null;
        const evidence = payload?.evidence;
        if (!evidence || typeof evidence !== "object") continue;

        let contributed = false;
        for (const key of EVIDENCE_COMPONENT_KEYS) {
            const raw = evidence[key];
            if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) continue;

            const value = Math.min(100, Math.max(0, raw));
            sums[key] += value;
            counts[key] += 1;
            contributed = true;
        }

        if (contributed) responseCount += 1;
    }

    if (responseCount === 0) return null;

    const components: Partial<EvidenceConfidenceInput> = {};
    for (const key of EVIDENCE_COMPONENT_KEYS) {
        if (counts[key] > 0) {
            components[key] = round1(sums[key] / counts[key]);
        }
    }

    return { components, responseCount };
}

/** Mean of the community components that were actually provided. */
export function averageCommunityEvidence(community: CommunityEvidence): number {
    const values = EVIDENCE_COMPONENT_KEYS.map((key) => community.components[key]).filter(
        (value): value is number => value != null,
    );
    if (values.length === 0) return 0;
    return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/**
 * Combines official evidence records with community evidence.
 *
 * - no community input → official only;
 * - no official record → community only (still PENDING, see shouldMarkVerified);
 * - both → community weight is proportional to its share of sources, capped at
 *   50% so official evidence always keeps at least half of the confidence.
 */
export function mergeEvidenceConfidence(
    official: EvidenceConfidenceInput,
    officialCount: number,
    community: CommunityEvidence | null,
): MergedEvidenceConfidence {
    if (!community || community.responseCount === 0) {
        return {
            input: official,
            communityWeight: 0,
            source: officialCount > 0 ? "OFFICIAL" : "NONE",
        };
    }

    const communityWeight =
        officialCount > 0
            ? Math.min(
                  0.5,
                  community.responseCount / (officialCount + community.responseCount),
              )
            : 1;

    const input: EvidenceConfidenceInput = { ...official };
    for (const key of EVIDENCE_COMPONENT_KEYS) {
        const value = community.components[key];
        if (value == null) continue;
        input[key] = round1(official[key] * (1 - communityWeight) + value * communityWeight);
    }

    return {
        input,
        communityWeight,
        source: officialCount > 0 ? "BLENDED" : "COMMUNITY",
    };
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
