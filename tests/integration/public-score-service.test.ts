import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPrismaMockInstance } from "./mock-prisma";

vi.mock("@/lib/prisma", async () => {
    const { getPrismaMockInstance } = await import("./mock-prisma");
    return { prisma: getPrismaMockInstance() };
});

const prismaMock = getPrismaMockInstance();

import {
    getPublicAceshScores,
    publicDisplayScore,
} from "@/lib/services/acesh/public-score-service";

describe("public score service (traveller-facing)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns scores only for destinations that have an assessment", async () => {
        prismaMock.aceshAssessment.findMany.mockResolvedValue([
            {
                destinationId: "dest-a",
                verifiedScore: 58.2,
                baseScore: 64.2,
                classification: "BERKEMBANG",
                verificationStatus: "VERIFIED",
            },
        ]);

        const scores = await getPublicAceshScores(["dest-a", "dest-b"]);
        expect(scores.size).toBe(1);
        expect(scores.has("dest-b")).toBe(false);
        expect(scores.get("dest-a")?.verifiedScore).toBe(58.2);
    });

    it("skips the query entirely when no destination ids are given", async () => {
        const scores = await getPublicAceshScores([]);
        expect(scores.size).toBe(0);
        expect(prismaMock.aceshAssessment.findMany).not.toHaveBeenCalled();
    });

    it("never exposes a verified score for PENDING assessments", () => {
        const pending = publicDisplayScore(
            {
                verifiedScore: 58.2,
                baseScore: 64.2,
                classification: "BERKEMBANG",
                verificationStatus: "PENDING",
            },
            null,
        );
        expect(pending).toBe(64.2);
    });

    it("uses the verified score for VERIFIED assessments", () => {
        const verified = publicDisplayScore(
            {
                verifiedScore: 58.2,
                baseScore: 64.2,
                classification: "BERKEMBANG",
                verificationStatus: "VERIFIED",
            },
            null,
        );
        expect(verified).toBe(58.2);
    });

    it("falls back to the legacy score when no assessment exists", () => {
        expect(publicDisplayScore(undefined, 70)).toBe(70);
        expect(publicDisplayScore(undefined, null)).toBe(0);
    });
});
