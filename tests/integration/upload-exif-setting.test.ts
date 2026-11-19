import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    getSession: vi.fn(),
    rateLimit: vi.fn(),
    getClientKey: vi.fn(),
    optimizeImage: vi.fn(),
    extractExif: vi.fn(),
    recordPhotoMetadata: vi.fn(),
    evaluatePhotoValidity: vi.fn(),
    getExifValidationEnabled: vi.fn(),
    uploadStream: vi.fn(),
}));

vi.mock("cloudinary", () => ({
    v2: {
        config: vi.fn(),
        uploader: {
            upload_stream: (...args: unknown[]) => mocks.uploadStream(...args),
            destroy: vi.fn(),
        },
    },
}));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("@/lib/security/rate-limit", () => ({
    rateLimit: mocks.rateLimit,
    getClientKey: mocks.getClientKey,
}));
vi.mock("@/lib/upload/optimizeImage", () => ({
    optimizeImage: mocks.optimizeImage,
}));
vi.mock("@/lib/services/photo-validation-service", () => ({
    extractExif: mocks.extractExif,
    recordPhotoMetadata: mocks.recordPhotoMetadata,
    evaluatePhotoValidity: mocks.evaluatePhotoValidity,
}));
vi.mock("@/lib/services/photo-validation-settings-service", () => ({
    getExifValidationEnabled: mocks.getExifValidationEnabled,
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/upload/route";

function createUploadRequest() {
    const formData = new FormData();
    formData.set("file", new File([new Uint8Array([1, 2, 3])], "proof.jpg", {
        type: "image/jpeg",
    }));
    return new NextRequest(
        "http://localhost/api/upload?folder=destinations&lat=-6.9&lng=107.6",
        { method: "POST", body: formData },
    );
}

describe("upload route follows the global EXIF setting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getSession.mockResolvedValue({ user: { id: "admin-1" } });
        mocks.rateLimit.mockReturnValue({ allowed: true });
        mocks.optimizeImage.mockResolvedValue(Buffer.from([1, 2, 3]));
        mocks.extractExif.mockResolvedValue({
            latitude: -6.9,
            longitude: 107.6,
            capturedAt: new Date("2026-11-19T00:00:00Z"),
            raw: { latitude: -6.9, longitude: 107.6 },
        });
        mocks.evaluatePhotoValidity.mockReturnValue({
            validityStatus: "VALID",
            distanceMeters: 2,
            notes: "Foto sesuai lokasi.",
        });
        mocks.uploadStream.mockImplementation((_options, callback) => ({
            end: () =>
                callback(null, {
                    public_id: "destinations/proof",
                    secure_url: "https://res.cloudinary.com/test/image/upload/proof.webp",
                    bytes: 42,
                    format: "webp",
                }),
        }));
    });

    it("skips EXIF extraction, persistence, and validation when disabled", async () => {
        mocks.getExifValidationEnabled.mockResolvedValue(false);

        const response = await POST(createUploadRequest());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.validationEnabled).toBe(false);
        expect(body.data.validity.validityStatus).toBe("PENDING");
        expect(body.data.metadata).toEqual({
            latitude: null,
            longitude: null,
            capturedAt: null,
        });
        expect(mocks.extractExif).not.toHaveBeenCalled();
        expect(mocks.recordPhotoMetadata).not.toHaveBeenCalled();
        expect(mocks.evaluatePhotoValidity).not.toHaveBeenCalled();
    });

    it("keeps extracting and validating EXIF when enabled", async () => {
        mocks.getExifValidationEnabled.mockResolvedValue(true);

        const response = await POST(createUploadRequest());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.validationEnabled).toBe(true);
        expect(body.data.validity.validityStatus).toBe("VALID");
        expect(mocks.extractExif).toHaveBeenCalledTimes(1);
        expect(mocks.recordPhotoMetadata).toHaveBeenCalledTimes(1);
        expect(mocks.evaluatePhotoValidity).toHaveBeenCalledTimes(1);
    });
});
