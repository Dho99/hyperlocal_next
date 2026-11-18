import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPrismaMockInstance } from "./mock-prisma";

vi.mock("@/lib/prisma", async () => {
    const { getPrismaMockInstance } = await import("./mock-prisma");
    return { prisma: getPrismaMockInstance() };
});

vi.mock("@/lib/services/acesh/assessment-recalculation-service", () => ({
    calculateAndSaveAssessment: vi.fn(),
}));

const prismaMock = getPrismaMockInstance();

import {
    createSurveyResponse,
    getPublicSurveyEntries,
    getUserSurveyResponse,
    SurveyAlreadySubmittedError,
} from "@/lib/services/survey-service";

const DESTINATION_ID = "destination-1";
const USER_ID = "user-1";

const SCORES = {
    indicators: { indicator1: 4, indicator2: 3 },
    evidence: { sourceReliability: 70 },
};

describe("survey service — one response per user", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        prismaMock.destination.findUnique.mockResolvedValue({ id: DESTINATION_ID });
        prismaMock.$transaction.mockImplementation(
            async (arg: unknown) =>
                typeof arg === "function"
                    ? (arg as (tx: typeof prismaMock) => unknown)(prismaMock)
                    : arg,
        );
        prismaMock.aceshIndicator.findMany.mockResolvedValue([]);
        prismaMock.aceshIndicatorScore.findMany.mockResolvedValue([]);
        prismaMock.destinationSurveyResponse.findMany.mockResolvedValue([]);
    });

    it("persists the rating and recalculates the public aggregate", async () => {
        prismaMock.destinationSurveyResponse.findUnique.mockResolvedValue(null);
        prismaMock.destinationSurveyResponse.create.mockResolvedValue({
            id: "survey-1",
            overallScore: 87.5,
            comment: "Bagus",
        });
        prismaMock.destinationSurveyResponse.aggregate.mockResolvedValue({
            _avg: { overallScore: 87.5 },
            _count: { _all: 1 },
        });
        prismaMock.destination.update.mockResolvedValue({ id: DESTINATION_ID });

        const survey = await createSurveyResponse({
            destinationId: DESTINATION_ID,
            userId: USER_ID,
            scores: SCORES,
            comment: "Bagus",
        });

        expect(survey).toMatchObject({ id: "survey-1" });
        expect(prismaMock.destinationSurveyResponse.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.destination.update).toHaveBeenCalledWith({
            where: { id: DESTINATION_ID },
            data: { rating: 4.4, reviewCount: 1 },
        });
    });

    it("rejects a second attempt by the same user", async () => {
        prismaMock.destinationSurveyResponse.findUnique.mockResolvedValue({
            id: "survey-existing",
        });

        await expect(
            createSurveyResponse({
                destinationId: DESTINATION_ID,
                userId: USER_ID,
                scores: SCORES,
            }),
        ).rejects.toBeInstanceOf(SurveyAlreadySubmittedError);

        expect(prismaMock.destinationSurveyResponse.create).not.toHaveBeenCalled();
    });

    it("maps a unique-constraint race (P2002) to the same error", async () => {
        prismaMock.destinationSurveyResponse.findUnique.mockResolvedValue(null);
        prismaMock.destinationSurveyResponse.create.mockRejectedValue({
            code: "P2002",
        });

        await expect(
            createSurveyResponse({
                destinationId: DESTINATION_ID,
                userId: USER_ID,
                scores: SCORES,
            }),
        ).rejects.toBeInstanceOf(SurveyAlreadySubmittedError);
    });

    it("returns the signed-in user's own response", async () => {
        prismaMock.destinationSurveyResponse.findUnique.mockResolvedValue({
            id: "survey-1",
            scores: SCORES,
            overallScore: 87.5,
            comment: "Bagus",
            createdAt: new Date(),
            scoreHiddenAt: null,
            commentHiddenAt: null,
        });

        const response = await getUserSurveyResponse(DESTINATION_ID, USER_ID);

        expect(prismaMock.destinationSurveyResponse.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    destinationId_userId: {
                        destinationId: DESTINATION_ID,
                        userId: USER_ID,
                    },
                },
            }),
        );
        expect(response?.id).toBe("survey-1");
    });
});

describe("public survey entries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows ratings without comments and hides moderated fields", async () => {
        const createdAt = new Date("2026-11-01T00:00:00Z");
        prismaMock.destinationSurveyResponse.findMany.mockResolvedValue([
            {
                id: "visible",
                comment: null,
                overallScore: 80,
                scoreHiddenAt: null,
                commentHiddenAt: null,
                createdAt,
                user: { name: "A", image: null },
            },
            {
                id: "hidden-score",
                comment: "Tetap tampil",
                overallScore: 90,
                scoreHiddenAt: createdAt,
                commentHiddenAt: null,
                createdAt,
                user: { name: "B", image: null },
            },
            {
                id: "hidden-comment",
                comment: "Disembunyikan",
                overallScore: 70,
                scoreHiddenAt: null,
                commentHiddenAt: createdAt,
                createdAt,
                user: { name: "C", image: null },
            },
        ]);

        const entries = await getPublicSurveyEntries(DESTINATION_ID);

        expect(entries.map((entry) => entry.id)).toEqual([
            "visible",
            "hidden-score",
            "hidden-comment",
        ]);
        expect(entries[0].overallScore).toBe(80);
        expect(entries[1].overallScore).toBeNull();
        expect(entries[1].comment).toBe("Tetap tampil");
        expect(entries[2].comment).toBeNull();
        expect(entries[2].overallScore).toBe(70);
    });
});
