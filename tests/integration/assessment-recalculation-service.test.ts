import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getPrismaMockInstance,
    buildIndicatorFixtures,
    buildOfficialScores,
    buildOfficialEvidence,
} from "./mock-prisma";

vi.mock("@/lib/prisma", async () => {
    const { getPrismaMockInstance } = await import("./mock-prisma");
    return { prisma: getPrismaMockInstance() };
});

const prismaMock = getPrismaMockInstance();

import {
    calculateAndSaveAssessment,
    calculateAssessmentSnapshot,
} from "@/lib/services/acesh/assessment-recalculation-service";

const DESTINATION_ID = "destination-1";
const FIXED_NOW = new Date("2026-08-01T00:00:00Z");

describe("assessment recalculation service (mocked Prisma)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        prismaMock.aceshIndicator.findMany.mockResolvedValue(
            buildIndicatorFixtures(),
        );
    });

    it("reproduces the official simulation snapshot (58.2 → VERIFIED / BERKEMBANG)", async () => {
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue(
            buildOfficialScores(DESTINATION_ID),
        );
        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue(
            buildOfficialEvidence(DESTINATION_ID, FIXED_NOW),
        );

        const snapshot = await calculateAssessmentSnapshot(DESTINATION_ID, FIXED_NOW);

        expect(snapshot.acesScore).toBe(66.8);
        expect(snapshot.hyperlocalScore).toBe(59.5);
        expect(snapshot.baseScore).toBe(64.2);
        expect(snapshot.evidenceConfidenceScore).toBe(69);
        expect(snapshot.evidenceFactor).toBe(0.907);
        expect(snapshot.verifiedScore).toBe(58.2);
        expect(snapshot.verificationStatus).toBe("VERIFIED");
        expect(snapshot.classification).toBe("BERKEMBANG");
    });

    it("stores exactly one assessment per destination (anti-duplication via upsert on destinationId)", async () => {
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue([]);
        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue([]);
        prismaMock.aceshAssessment.upsert.mockResolvedValue({ id: "assessment-1" });
        prismaMock.aceshAssessmentHistory.create.mockResolvedValue({ id: "history-1" });

        await calculateAndSaveAssessment(DESTINATION_ID, "user-1", "test");

        expect(prismaMock.aceshAssessment.upsert).toHaveBeenCalledTimes(1);
        const upsertCall = prismaMock.aceshAssessment.upsert.mock.calls[0][0] as {
            where: { destinationId: string };
        };
        expect(upsertCall.where).toEqual({ destinationId: DESTINATION_ID });

        expect(prismaMock.aceshAssessmentHistory.create).toHaveBeenCalledTimes(1);
    });

    it("marks PENDING with a null verifiedScore when evidence confidence is insufficient", async () => {
        // full scores but a single low-quality record → confidence 0
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue(
            buildOfficialScores(DESTINATION_ID),
        );
        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue([
            {
                id: "evidence-only",
                destinationId: DESTINATION_ID,
                sourceReliabilityScore: null,
                documentUrl: null,
                photoUrl: null,
                latitude: null,
                longitude: null,
                managementConfirmed: false,
                fieldValidated: false,
                dataDate: null,
                validatedAt: null,
                createdAt: FIXED_NOW,
            },
        ]);

        const snapshot = await calculateAssessmentSnapshot(DESTINATION_ID, FIXED_NOW);

        expect(snapshot.verificationStatus).toBe("PENDING");
        expect(snapshot.verifiedScore).toBeNull();
        expect(snapshot.baseScore).toBe(64.2);
        // classification falls back to the base score while PENDING
        expect(snapshot.classification).toBe("BERKEMBANG");
    });

    it("recalculates when evidence changes — VERIFIED flips to PENDING after evidence removal", async () => {
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue(
            buildOfficialScores(DESTINATION_ID),
        );

        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue(
            buildOfficialEvidence(DESTINATION_ID, FIXED_NOW),
        );
        const withEvidence = await calculateAssessmentSnapshot(DESTINATION_ID, FIXED_NOW);
        expect(withEvidence.verificationStatus).toBe("VERIFIED");

        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue([]);
        const withoutEvidence = await calculateAssessmentSnapshot(DESTINATION_ID, FIXED_NOW);
        expect(withoutEvidence.verificationStatus).toBe("PENDING");
        expect(withoutEvidence.verifiedScore).toBeNull();
    });

    it("writes a history row every time the assessment is saved", async () => {
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue([]);
        prismaMock.aceshEvidenceRecord.findMany.mockResolvedValue([]);
        prismaMock.aceshAssessment.upsert.mockResolvedValue({ id: "assessment-1" });
        prismaMock.aceshAssessmentHistory.create.mockResolvedValue({ id: "history-1" });

        await calculateAndSaveAssessment(DESTINATION_ID);
        await calculateAndSaveAssessment(DESTINATION_ID);

        expect(prismaMock.aceshAssessment.upsert).toHaveBeenCalledTimes(2);
        expect(prismaMock.aceshAssessmentHistory.create).toHaveBeenCalledTimes(2);
    });
});
