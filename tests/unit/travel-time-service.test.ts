import { describe, expect, it, vi } from "vitest";
import {
    estimateTravelTime,
    DEFAULT_TRAVEL_TIME_OPTIONS,
} from "@/lib/services/acesh/travel-time-service";

describe("travel time estimation", () => {
    it("falls back to speed-based estimation when OSRM is not configured", async () => {
        const result = await estimateTravelTime(
            -7.3274, 108.2207,
            -7.3275, 108.2209,
            "WALKING",
            { osrmBaseUrl: undefined, timeoutMs: 1000 },
        );
        expect(result.source).toBe("ESTIMATION");
        expect(result.travelMode).toBe("WALKING");
        expect(result.distanceMeters).toBeGreaterThan(0);
        expect(result.travelMinutes).toBeGreaterThanOrEqual(1);
    });

    it("uses OSRM routing when a route is returned", async () => {
        const fetchFn = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                code: "Ok",
                routes: [{ duration: 420, distance: 1100 }],
            }),
        });
        const result = await estimateTravelTime(
            -7.3274, 108.2207,
            -7.3275, 108.2209,
            "DRIVING",
            { osrmBaseUrl: "https://router.project-osrm.org", fetchFn: fetchFn as unknown as typeof fetch, timeoutMs: 1000 },
        );
        expect(result.source).toBe("ROUTING");
        expect(result.distanceMeters).toBe(1100);
        expect(result.travelMinutes).toBe(7);
        expect(fetchFn).toHaveBeenCalledWith(
            expect.stringContaining("/route/v1/driving/"),
            expect.anything(),
        );
    });

    it("falls back to estimation when OSRM fails or times out", async () => {
        const fetchFn = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({}),
        });
        const result = await estimateTravelTime(
            -7.3274, 108.2207,
            -7.3275, 108.2209,
            "DRIVING",
            { osrmBaseUrl: "https://router.project-osrm.org", fetchFn: fetchFn as unknown as typeof fetch, timeoutMs: 500 },
        );
        expect(result.source).toBe("ESTIMATION");
        expect(result.distanceMeters).toBeGreaterThan(0);
    });

    it("throws when coordinates are missing", async () => {
        await expect(
            estimateTravelTime(null, null, -7.3275, 108.2209, "WALKING", DEFAULT_TRAVEL_TIME_OPTIONS),
        ).rejects.toThrow();
    });
});
