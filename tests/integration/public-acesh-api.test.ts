import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPrismaMockInstance } from "./mock-prisma";

vi.mock("@/lib/prisma", async () => {
    const { getPrismaMockInstance } = await import("./mock-prisma");
    return { prisma: getPrismaMockInstance() };
});

const prismaMock = getPrismaMockInstance();

import { GET } from "@/app/api/destinations/[id]/acesh/route";

const VERIFIED_ASSESSMENT = {
    id: "assessment-1",
    destinationId: "dest-a",
    acesScore: 66.8,
    hyperlocalScore: 59.5,
    baseScore: 64.2,
    evidenceConfidenceScore: 69,
    evidenceFactor: 0.907,
    verifiedScore: 58.2,
    classification: "BERKEMBANG",
    verificationStatus: "VERIFIED",
    calculationVersion: "ACES-H-1.0",
    calculatedAt: new Date("2026-08-01T00:00:00Z"),
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
};

const PENDING_ASSESSMENT = {
    ...VERIFIED_ASSESSMENT,
    id: "assessment-2",
    destinationId: "dest-b",
    verifiedScore: null,
    verificationStatus: "PENDING",
    classification: "BERKEMBANG",
};

describe("public ACES-H API endpoint", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        prismaMock.destination.findFirst.mockImplementation(async (args) => {
            const requestedId = args?.where?.OR?.[0]?.id ?? "unknown";
            return {
                id: requestedId,
                halalScore: 0,
            } as never;
        });
    });

    it("returns the verified score for VERIFIED assessments", async () => {
        prismaMock.aceshAssessment.findUnique.mockResolvedValue(VERIFIED_ASSESSMENT);

        const response = await GET(new Request("http://localhost/api/destinations/dest-a/acesh"), {
            params: Promise.resolve({ id: "dest-a" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.verifiedScore).toBe(58.2);
        expect(body.data.verificationStatus).toBe("VERIFIED");
    });

    it("returns null verifiedScore for PENDING assessments — no fabricated score", async () => {
        prismaMock.aceshAssessment.findUnique.mockResolvedValue(PENDING_ASSESSMENT);

        const response = await GET(new Request("http://localhost/api/destinations/dest-b/acesh"), {
            params: Promise.resolve({ id: "dest-b" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.verifiedScore).toBeNull();
        expect(body.data.baseScore).toBe(64.2);
        expect(body.data.verificationStatus).toBe("PENDING");
    });

    it("never exposes internal evidence through the public endpoint", async () => {
        prismaMock.aceshAssessment.findUnique.mockResolvedValue(VERIFIED_ASSESSMENT);

        const response = await GET(new Request("http://localhost/api/destinations/dest-a/acesh"), {
            params: Promise.resolve({ id: "dest-a" }),
        });
        const body = await response.json();
        const keys = Object.keys(body.data);

        expect(keys).not.toContain("evidenceRecords");
        expect(keys).not.toContain("sourceReliability");
        expect(keys).not.toContain("validator");
    });

    it("returns 404 when no assessment exists", async () => {
        prismaMock.aceshAssessment.findUnique.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/destinations/unknown/acesh"), {
            params: Promise.resolve({ id: "unknown" }),
        });

        expect(response.status).toBe(404);
    });
});
