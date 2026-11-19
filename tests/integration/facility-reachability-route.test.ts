import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, getRowsMock } = vi.hoisted(() => ({
    requireAdminMock: vi.fn(),
    getRowsMock: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/services/acesh/facility-reachability-service", () => ({
    getDestinationFacilityReachability: getRowsMock,
}));

import { GET } from "@/app/api/admin/destinations/[id]/facility-reachability/route";

const PARAMS = { params: Promise.resolve({ id: "destination-1" }) };

describe("admin destination facility reachability route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("requires an admin", async () => {
        requireAdminMock.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/test"), PARAMS);

        expect(response.status).toBe(401);
        expect(getRowsMock).not.toHaveBeenCalled();
    });

    it("returns 404 when the destination does not exist", async () => {
        requireAdminMock.mockResolvedValue({ user: { id: "admin-1" } });
        getRowsMock.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/test"), PARAMS);

        expect(response.status).toBe(404);
    });

    it("returns live rows with no-store caching", async () => {
        requireAdminMock.mockResolvedValue({ user: { id: "admin-1" } });
        getRowsMock.mockResolvedValue([
            {
                id: "df-1",
                facilityName: "Masjid",
                facilityType: "MOSQUE",
                latitude: -7.3,
                longitude: 108.2,
                stored: { distanceMeters: null, travelMinutes: null, travelMode: null },
                live: {
                    distanceMeters: 1200,
                    travelMinutes: 15,
                    travelMode: "WALKING",
                    source: "ESTIMATION",
                },
                liveReason: null,
                evidence: {
                    total: 0,
                    valid: 0,
                    invalidPosition: 0,
                    invalidTime: 0,
                    noMetadata: 0,
                },
            },
        ]);

        const response = await GET(new Request("http://localhost/api/test"), PARAMS);

        expect(response.status).toBe(200);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        await expect(response.json()).resolves.toEqual({
            data: expect.arrayContaining([
                expect.objectContaining({ facilityName: "Masjid" }),
            ]),
        });
        expect(getRowsMock).toHaveBeenCalledWith("destination-1");
    });
});
