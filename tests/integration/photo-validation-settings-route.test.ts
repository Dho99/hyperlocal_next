import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, getEnabledMock, setEnabledMock } = vi.hoisted(() => ({
    requireAdminMock: vi.fn(),
    getEnabledMock: vi.fn(),
    setEnabledMock: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/services/photo-validation-settings-service", () => ({
    getExifValidationEnabled: getEnabledMock,
    setExifValidationEnabled: setEnabledMock,
}));

import { GET, PUT } from "@/app/api/admin/settings/photo-validation/route";

describe("admin photo-validation settings route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("requires an admin for GET", async () => {
        requireAdminMock.mockResolvedValue(null);

        const response = await GET();

        expect(response.status).toBe(401);
        expect(getEnabledMock).not.toHaveBeenCalled();
    });

    it("returns the persisted setting to admins", async () => {
        requireAdminMock.mockResolvedValue({ user: { id: "admin-1" } });
        getEnabledMock.mockResolvedValue(false);

        const response = await GET();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            data: { isExifValidationEnabled: false },
        });
    });

    it("rejects non-boolean updates", async () => {
        requireAdminMock.mockResolvedValue({ user: { id: "admin-1" } });
        const request = new Request("http://localhost/api/admin/settings/photo-validation", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isExifValidationEnabled: "false" }),
        });

        const response = await PUT(request);

        expect(response.status).toBe(400);
        expect(setEnabledMock).not.toHaveBeenCalled();
    });

    it("persists valid updates with the current admin id", async () => {
        requireAdminMock.mockResolvedValue({ user: { id: "admin-1" } });
        setEnabledMock.mockResolvedValue({ isExifValidationEnabled: false });
        const request = new Request("http://localhost/api/admin/settings/photo-validation", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isExifValidationEnabled: false }),
        });

        const response = await PUT(request);

        expect(response.status).toBe(200);
        expect(setEnabledMock).toHaveBeenCalledWith(false, "admin-1");
        await expect(response.json()).resolves.toEqual({
            data: { isExifValidationEnabled: false },
        });
    });
});
