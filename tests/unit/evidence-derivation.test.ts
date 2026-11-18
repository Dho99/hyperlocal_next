import { describe, expect, it } from "vitest";
import {
    averageCommunityEvidence,
    deriveCommunityEvidence,
    deriveEvidenceConfidence,
    mergeEvidenceConfidence,
    shouldMarkVerified,
    MIN_VERIFIED_CONFIDENCE,
    MIN_VERIFIED_RECORDS,
} from "@/lib/services/acesh/evidence-derivation";
import type { EvidenceRecordLike } from "@/lib/services/acesh/evidence-derivation";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The engineered 20-record dataset used by the seeder — reproduces the
 * official confidence components (70/75/70/65/70/60 → 69.0).
 */
function buildOfficialRecords(now: Date): EvidenceRecordLike[] {
    const ages = [
        30, 30, 30, 30,
        120, 120, 120, 120, 120, 120,
        250, 250, 250, 250,
        500, 500, 500, 500, 500, 500,
    ];
    return ages.map((ageDays, i) => ({
        sourceReliabilityScore: 70,
        documentUrl: i < 15 ? `https://example.com/doc-${i}.pdf` : null,
        photoUrl: i < 14 ? `https://example.com/photo-${i}.jpg` : null,
        latitude: -7.3 + i * 0.001,
        longitude: 108.2 + i * 0.001,
        managementConfirmed: i < 13,
        fieldValidated: i < 14,
        dataDate: new Date(now.getTime() - ageDays * DAY_MS),
        validatedAt: i < 14 ? new Date(now.getTime() - Math.max(7, ageDays - 30) * DAY_MS) : null,
        createdAt: now,
    }));
}

describe("evidence derivation", () => {
    const now = new Date("2026-08-01T00:00:00Z");

    it("derives the official confidence components from 20 engineered records", () => {
        // derive at a slightly later instant than record creation, like real usage,
        // so the 90-day freshness boundary resolves to the 75 bucket
        const derived = deriveEvidenceConfidence(
            buildOfficialRecords(now),
            new Date(now.getTime() + 60_000),
        );
        expect(derived.sourceReliability).toBe(70);
        expect(derived.documentEvidence).toBe(75);
        expect(derived.photoGeolocation).toBe(70);
        expect(derived.managementConfirmation).toBe(65);
        expect(derived.fieldValidation).toBe(70);
        expect(derived.dataFreshness).toBe(60);
    });

    it("returns zero components when there are no records", () => {
        const derived = deriveEvidenceConfidence([], now);
        expect(derived).toEqual({
            sourceReliability: 0,
            documentEvidence: 0,
            photoGeolocation: 0,
            managementConfirmation: 0,
            fieldValidation: 0,
            dataFreshness: 0,
        });
    });

    it("uses validatedAt ?? dataDate ?? createdAt as the freshness reference", () => {
        const records: EvidenceRecordLike[] = [
            {
                sourceReliabilityScore: 80,
                documentUrl: null,
                photoUrl: null,
                latitude: null,
                longitude: null,
                managementConfirmed: false,
                fieldValidated: false,
                dataDate: new Date(now.getTime() - 500 * DAY_MS),
                validatedAt: new Date(now.getTime() - 30 * DAY_MS),
                createdAt: now,
            },
        ];
        const derived = deriveEvidenceConfidence(records, now);
        expect(derived.dataFreshness).toBe(100);
        expect(derived.sourceReliability).toBe(80);
    });

    it("marks verified only above the confidence and record thresholds", () => {
        expect(shouldMarkVerified(MIN_VERIFIED_CONFIDENCE, MIN_VERIFIED_RECORDS)).toBe(true);
        expect(shouldMarkVerified(MIN_VERIFIED_CONFIDENCE - 0.1, MIN_VERIFIED_RECORDS)).toBe(false);
        expect(shouldMarkVerified(MIN_VERIFIED_CONFIDENCE, MIN_VERIFIED_RECORDS - 1)).toBe(false);
    });
});

describe("community evidence from surveys", () => {
    const perfect = {
        scores: {
            evidence: {
                sourceReliability: 100,
                documentEvidence: 100,
                photoGeolocation: 100,
                managementConfirmation: 100,
                fieldValidation: 100,
                dataFreshness: 100,
            },
        },
    };

    it("ignores responses whose evidence components are all zero", () => {
        const zero = {
            scores: {
                evidence: {
                    sourceReliability: 0,
                    documentEvidence: 0,
                    photoGeolocation: 0,
                    managementConfirmation: 0,
                    fieldValidation: 0,
                    dataFreshness: 0,
                },
            },
        };

        expect(deriveCommunityEvidence([zero])).toBeNull();
        expect(deriveCommunityEvidence([])).toBeNull();
    });

    it("averages only the components visitors actually filled", () => {
        const community = deriveCommunityEvidence([
            perfect,
            {
                scores: {
                    evidence: {
                        sourceReliability: 50,
                        documentEvidence: 0,
                        photoGeolocation: 80,
                        managementConfirmation: 0,
                        fieldValidation: 100,
                        dataFreshness: 0,
                    },
                },
            },
        ]);

        expect(community?.responseCount).toBe(2);
        expect(community?.components.sourceReliability).toBe(75);
        expect(community?.components.documentEvidence).toBe(100);
        expect(community?.components.photoGeolocation).toBe(90);
        expect(community?.components.managementConfirmation).toBe(100);
        expect(community?.components.fieldValidation).toBe(100);
        expect(community?.components.dataFreshness).toBe(100);
        expect(community ? averageCommunityEvidence(community) : null).toBe(94.2);
    });

    it("uses community evidence fully when there are no official records", () => {
        const community = deriveCommunityEvidence([perfect]);
        const official = deriveEvidenceConfidence([]);
        const merged = mergeEvidenceConfidence(official, 0, community);

        expect(merged.source).toBe("COMMUNITY");
        expect(merged.communityWeight).toBe(1);
        expect(merged.input.sourceReliability).toBe(100);
    });

    it("caps community influence at 50% when official evidence exists", () => {
        const community = deriveCommunityEvidence([perfect]);
        const official = {
            sourceReliability: 70,
            documentEvidence: 75,
            photoGeolocation: 70,
            managementConfirmation: 65,
            fieldValidation: 70,
            dataFreshness: 60,
        };

        const merged = mergeEvidenceConfidence(official, 20, community);

        expect(merged.source).toBe("BLENDED");
        expect(merged.communityWeight).toBeLessThanOrEqual(0.5);
        expect(merged.input.sourceReliability).toBeGreaterThan(official.sourceReliability);
        expect(merged.input.sourceReliability).toBeLessThanOrEqual(85);
    });
});
