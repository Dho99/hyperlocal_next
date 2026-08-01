import { describe, expect, it } from "vitest";
import {
    deriveEvidenceConfidence,
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
