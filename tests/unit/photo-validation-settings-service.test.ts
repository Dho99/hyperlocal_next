import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        photoValidationConfig: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },
    },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
    DEFAULT_EXIF_VALIDATION_ENABLED,
    getExifValidationEnabled,
    setExifValidationEnabled,
} from "@/lib/services/photo-validation-settings-service";

describe("photo validation settings service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the persisted switch value", async () => {
        prismaMock.photoValidationConfig.findUnique.mockResolvedValue({
            isExifValidationEnabled: false,
        });

        await expect(getExifValidationEnabled()).resolves.toBe(false);
    });

    it("defaults to enabled if the singleton row is missing", async () => {
        prismaMock.photoValidationConfig.findUnique.mockResolvedValue(null);

        await expect(getExifValidationEnabled()).resolves.toBe(
            DEFAULT_EXIF_VALIDATION_ENABLED,
        );
    });

    it("defaults to enabled if the settings query fails", async () => {
        prismaMock.photoValidationConfig.findUnique.mockRejectedValue(
            new Error("Database unavailable"),
        );

        await expect(getExifValidationEnabled()).resolves.toBe(true);
    });

    it("persists switch changes and the admin id", async () => {
        const config = {
            id: "default",
            isExifValidationEnabled: false,
            updatedBy: "admin-1",
        };
        prismaMock.photoValidationConfig.upsert.mockResolvedValue(config);

        await expect(setExifValidationEnabled(false, "admin-1")).resolves.toEqual(
            config,
        );
        expect(prismaMock.photoValidationConfig.upsert).toHaveBeenCalledWith({
            where: { id: "default" },
            update: { isExifValidationEnabled: false, updatedBy: "admin-1" },
            create: {
                id: "default",
                isExifValidationEnabled: false,
                updatedBy: "admin-1",
            },
        });
    });
});
