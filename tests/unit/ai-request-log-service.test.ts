import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        aiIntentLog: { create: vi.fn() },
    },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
    logAiRequest,
    sanitizeAiQuery,
} from "@/lib/services/ai-request-log-service";

describe("AI request logging", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        prismaMock.aiIntentLog.create.mockResolvedValue({ id: "log-1" });
    });

    it("caps stored user queries at 500 characters", () => {
        expect(sanitizeAiQuery("x".repeat(800))).toHaveLength(500);
    });

    it("stores provider, model, status, latency, and attempts", async () => {
        await logAiRequest({
            feature: "ROUTE_FINDER",
            userQuery: "cari musola di situ gede",
            intent: "FACILITY_CHECK",
            redirectTo: "/facility-check?slug=situ-gede-attractions&facility=musola",
            provider: "groq",
            model: "llama-3.1-8b-instant",
            status: "SUCCESS",
            latencyMs: 840,
            attemptCount: 2,
        });

        expect(prismaMock.aiIntentLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                feature: "ROUTE_FINDER",
                userQuery: "cari musola di situ gede",
                intent: "FACILITY_CHECK",
                provider: "groq",
                model: "llama-3.1-8b-instant",
                status: "SUCCESS",
                latencyMs: 840,
                attemptCount: 2,
                isValid: true,
            }),
        });
    });

    it("does not break the request when the DB write fails", async () => {
        prismaMock.aiIntentLog.create.mockRejectedValue(new Error("DB down"));

        await expect(
            logAiRequest({
                feature: "EXPLORE",
                userQuery: "wisata halal",
                intent: "EXPLORE_RECOMMENDATION",
                provider: "none",
                status: "FALLBACK",
            }),
        ).resolves.toBeUndefined();
    });
});
