import { describe, expect, it } from "vitest";
import {
    checkReachability,
    normalizeFacilityType,
} from "@/lib/services/acesh/reachability-config-service";

describe("reachability checks", () => {
    it("normalizes facility types to uppercase", () => {
        expect(normalizeFacilityType(" mosque ")).toBe("MOSQUE");
        expect(normalizeFacilityType(undefined)).toBe("");
    });

    it("flags a facility outside the distance limit as unreachable", () => {
        const result = checkReachability(1200, 12, {
            maxDistanceMeters: 1000,
            maxTravelMinutes: 15,
            travelMode: "DRIVING",
        });
        expect(result.withinDistance).toBe(false);
        expect(result.withinTime).toBe(true);
        expect(result.reachable).toBe(false);
    });

    it("flags a facility outside the time limit as unreachable", () => {
        const result = checkReachability(800, 20, {
            maxDistanceMeters: 1000,
            maxTravelMinutes: 15,
            travelMode: "DRIVING",
        });
        expect(result.reachable).toBe(false);
    });

    it("considers facilities reachable when within both limits", () => {
        const result = checkReachability(500, 10, {
            maxDistanceMeters: 500,
            maxTravelMinutes: 10,
            travelMode: "WALKING",
        });
        expect(result.reachable).toBe(true);
    });

    it("treats unconfigured limits as satisfied", () => {
        const result = checkReachability(null, null, {
            maxDistanceMeters: null,
            maxTravelMinutes: null,
            travelMode: null,
        });
        expect(result.reachable).toBe(true);
    });
});
