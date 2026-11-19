import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
    buildLiveFacilityRows,
    type ReachabilityDestinationInput,
} from "@/lib/services/acesh/facility-reachability-service";
import {
    evaluateFacilityReachability,
    resolveFacilityReachabilityKey,
    storedFacilityRows,
    summarizeEvidence,
} from "@/lib/facilities/facility-reachability";

const ESTIMATE = vi.fn(
    async (
        _fromLat: number,
        _fromLng: number,
        _toLat: number,
        _toLng: number,
        mode: "WALKING" | "DRIVING" | "CYCLING",
    ) => ({
        distanceMeters: 300,
        travelMinutes: 5,
        travelMode: mode,
        source: "ESTIMATION" as const,
    }),
);

const CONFIGS = [
    {
        facilityType: "MOSQUE",
        label: "Masjid",
        maxDistanceMeters: 500,
        maxTravelMinutes: 10,
        travelMode: "WALKING",
        isActive: true,
    },
];

function destination(
    overrides: Partial<ReachabilityDestinationInput> = {},
): ReachabilityDestinationInput {
    return {
        latitude: -7.32,
        longitude: 108.22,
        destinationHalalFacilities: [
            {
                id: "df-1",
                latitude: -7.321,
                longitude: 108.221,
                distanceMeters: 900,
                travelMinutes: 11,
                travelMode: null,
                facility: {
                    name: "Masjid",
                    facilityType: "MOSQUE",
                    latitude: -7.322,
                    longitude: 108.222,
                },
                evidences: [
                    { validityStatus: "VALID" },
                    { validityStatus: "VALID" },
                    { validityStatus: "NO_METADATA" },
                ],
            },
        ],
        ...overrides,
    };
}

describe("facility reachability live rows", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("computes live metrics and keeps stored values for comparison", async () => {
        const rows = await buildLiveFacilityRows(destination(), CONFIGS, ESTIMATE);

        expect(rows).toHaveLength(1);
        expect(rows[0].facilityName).toBe("Masjid");
        expect(rows[0].stored).toEqual({
            distanceMeters: 900,
            travelMinutes: 11,
            travelMode: null,
        });
        expect(rows[0].live).toEqual({
            distanceMeters: 300,
            travelMinutes: 5,
            travelMode: "WALKING",
            source: "ESTIMATION",
        });
        expect(rows[0].reachability.status).toBe("WITHIN");
        expect(rows[0].reachability.threshold?.key).toBe("MOSQUE");
        expect(rows[0].liveReason).toBeNull();
        expect(rows[0].evidence).toEqual({
            total: 3,
            valid: 2,
            invalidPosition: 0,
            invalidTime: 0,
            noMetadata: 1,
            pending: 0,
        });
        expect(ESTIMATE).toHaveBeenCalledWith(
            -7.32,
            108.22,
            -7.321,
            108.221,
            "WALKING",
        );
    });

    it("uses the configured travel mode over the stored mode", async () => {
        const input = destination();
        input.destinationHalalFacilities[0].travelMode = "DRIVING";

        await buildLiveFacilityRows(input, CONFIGS, ESTIMATE);

        expect(ESTIMATE).toHaveBeenLastCalledWith(
            -7.32,
            108.22,
            -7.321,
            108.221,
            "WALKING",
        );
    });

    it("falls back to the stored travel mode when there is no config", async () => {
        const input = destination();
        input.destinationHalalFacilities[0].travelMode = "DRIVING";

        await buildLiveFacilityRows(input, [], ESTIMATE);

        expect(ESTIMATE).toHaveBeenLastCalledWith(
            -7.32,
            108.22,
            -7.321,
            108.221,
            "DRIVING",
        );
    });

    it("returns a reason when the destination has no coordinates", async () => {
        const rows = await buildLiveFacilityRows(
            destination({ latitude: null, longitude: null }),
            CONFIGS,
            ESTIMATE,
        );

        expect(rows[0].live).toBeNull();
        expect(rows[0].liveReason).toBe("Koordinat destinasi belum diisi.");
        expect(ESTIMATE).not.toHaveBeenCalled();
    });

    it("returns a reason when the facility has no coordinates", async () => {
        const input = destination();
        input.destinationHalalFacilities[0].latitude = null;
        input.destinationHalalFacilities[0].facility = {
            name: "Masjid",
            facilityType: "MOSQUE",
            latitude: null,
            longitude: null,
        };

        const rows = await buildLiveFacilityRows(input, CONFIGS, ESTIMATE);

        expect(rows[0].live).toBeNull();
        expect(rows[0].liveReason).toBe("Koordinat fasilitas belum diisi.");
    });
});

describe("threshold evaluation", () => {
    it("maps ambiguous worship types by facility name", () => {
        expect(resolveFacilityReachabilityKey("religious", "Masjid Al-Amin")).toBe("MOSQUE");
        expect(resolveFacilityReachabilityKey("religious", "Musala Al-Ikhlas")).toBe("MUSALA");
        expect(resolveFacilityReachabilityKey("religious", "Rumah Ibadah")).toBeNull();
        expect(resolveFacilityReachabilityKey("restaurant", "Restoran Padang")).toBe(
            "RESTAURANT",
        );
    });

    it("marks facilities outside distance and time limits", () => {
        const result = evaluateFacilityReachability(
            { distanceMeters: 1400, travelMinutes: 6 },
            CONFIGS,
            "MOSQUE",
            "Masjid",
        );

        expect(result.status).toBe("OUTSIDE_DISTANCE");
        expect(result.withinDistance).toBe(false);
        expect(result.withinTime).toBe(true);
    });

    it("returns NO_CONFIG when the type has no active rule", () => {
        const result = evaluateFacilityReachability(
            { distanceMeters: 100, travelMinutes: 2 },
            [],
            "RESTAURANT",
            "Restoran",
        );

        expect(result.status).toBe("NO_CONFIG");
        expect(result.threshold).toBeNull();
    });
});

describe("stored facility fallback rows", () => {
    it("summarizes evidence statuses", () => {
        expect(
            summarizeEvidence([
                { validityStatus: "VALID" },
                { validityStatus: "INVALID_POSITION" },
                { validityStatus: "INVALID_TIME" },
                { validityStatus: "PENDING" },
            ]),
        ).toEqual({
            total: 4,
            valid: 1,
            invalidPosition: 1,
            invalidTime: 1,
            noMetadata: 0,
            pending: 1,
        });
    });

    it("maps stored metrics and sorts facilities by name", () => {
        const rows = storedFacilityRows([
            {
                id: "b",
                latitude: null,
                longitude: null,
                distanceMeters: 100,
                travelMinutes: 2,
                travelMode: "WALKING",
                facility: { name: "Zaitun", facilityType: "RESTAURANT" },
                evidences: [],
            },
            {
                id: "a",
                latitude: -7.3,
                longitude: 108.2,
                distanceMeters: null,
                travelMinutes: null,
                travelMode: null,
                facility: { name: "Al-Amin", facilityType: "MOSQUE" },
                evidences: [{ validityStatus: "VALID" }],
            },
        ]);

        expect(rows.map((row) => row.facilityName)).toEqual(["Al-Amin", "Zaitun"]);
        expect(rows[1].stored).toEqual({
            distanceMeters: 100,
            travelMinutes: 2,
            travelMode: "WALKING",
        });
        expect(rows[0].evidence.total).toBe(1);
    });
});
