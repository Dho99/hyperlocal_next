import exifr from "exifr";
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import {
    DEFAULT_PHOTO_TOLERANCE_METERS,
    PHOTO_CAPTURE_SKEW_MS,
    type PhotoValidityStatusValue,
} from "@/lib/config/photo-validation";

export interface ExtractedExif {
    latitude: number | null;
    longitude: number | null;
    capturedAt: Date | null;
    raw: Record<string, unknown> | null;
}

/**
 * Reads GPS coordinates and capture timestamp from the original image buffer.
 * Must run BEFORE any re-encoding (sharp) which strips EXIF.
 */
export async function extractExif(buffer: Buffer): Promise<ExtractedExif> {
    try {
        const parsed = (await exifr.parse(buffer, {
            gps: true,
            pick: [
                "latitude",
                "longitude",
                "GPSLatitude",
                "GPSLongitude",
                "DateTimeOriginal",
                "CreateDate",
            ],
        })) as Record<string, unknown> | undefined;

        if (!parsed) {
            return { latitude: null, longitude: null, capturedAt: null, raw: null };
        }

        const latitude =
            typeof parsed.latitude === "number" ? parsed.latitude : null;
        const longitude =
            typeof parsed.longitude === "number" ? parsed.longitude : null;

        const rawDate = parsed.DateTimeOriginal ?? parsed.CreateDate ?? null;
        const parsedDate = rawDate ? new Date(rawDate as string | Date) : null;
        const capturedAt =
            parsedDate && !Number.isNaN(parsedDate.getTime())
                ? parsedDate
                : null;

        let raw: Record<string, unknown> | null = null;
        try {
            raw = JSON.parse(JSON.stringify(parsed)) as Record<string, unknown>;
        } catch {
            raw = null;
        }

        return { latitude, longitude, capturedAt, raw };
    } catch {
        return { latitude: null, longitude: null, capturedAt: null, raw: null };
    }
}

export async function recordPhotoMetadata(input: {
    url: string;
    publicId?: string | null;
    exif: ExtractedExif;
}) {
    const { url, publicId, exif } = input;
    const data = {
        publicId: publicId ?? null,
        latitude: exif.latitude,
        longitude: exif.longitude,
        capturedAt: exif.capturedAt,
        exif: (exif.raw ?? undefined) as never,
    };
    return prisma.photoMetadata.upsert({
        where: { url },
        update: data,
        create: { url, ...data },
    });
}

export type PhotoMetadataRow = Awaited<
    ReturnType<typeof prisma.photoMetadata.findFirst>
>;

export async function getPhotoMetadataByUrls(urls: string[]) {
    const unique = Array.from(new Set(urls.filter(Boolean)));
    if (unique.length === 0) {
        return new Map<string, NonNullable<PhotoMetadataRow>>();
    }
    const rows = await prisma.photoMetadata.findMany({
        where: { url: { in: unique } },
    });
    return new Map(rows.map((row) => [row.url, row]));
}

export interface PhotoValidityInput {
    photoLat: number | null;
    photoLng: number | null;
    targetLat: number | null;
    targetLng: number | null;
    toleranceMeters?: number;
    capturedAt: Date | null;
    uploadedAt: Date | null;
    /** Whether a PhotoMetadata row exists (new uploads always do). */
    hasMetadata: boolean;
    /** Human label of the location the photo must prove (facility/destination). */
    targetLabel?: string;
}

export interface PhotoValidityResult {
    validityStatus: PhotoValidityStatusValue;
    distanceMeters: number | null;
    positionValid: boolean | null;
    timeValid: boolean | null;
    notes: string;
}

export interface PhotoValidationIssue {
    url: string;
    label: string;
    status: PhotoValidityStatusValue;
    distanceMeters: number | null;
    toleranceMeters: number;
    message: string;
}

export class PhotoValidationError extends Error {
    issues: PhotoValidationIssue[];

    constructor(issues: PhotoValidationIssue[]) {
        super(issues.map((i) => i.message).join(" "));
        this.name = "PhotoValidationError";
        this.issues = issues;
    }
}

export function evaluatePhotoValidity(
    input: PhotoValidityInput,
): PhotoValidityResult {
    const tolerance =
        input.toleranceMeters ?? DEFAULT_PHOTO_TOLERANCE_METERS;
    const target = input.targetLabel ?? "lokasi yang dibuktikan";

    // Legacy photos uploaded before this feature: no metadata row -> advisory.
    if (!input.hasMetadata) {
        return {
            validityStatus: "NO_METADATA",
            distanceMeters: null,
            positionValid: null,
            timeValid: null,
            notes: "Foto lama tanpa metadata — tidak diverifikasi.",
        };
    }

    if (input.photoLat == null || input.photoLng == null) {
        return {
            validityStatus: "INVALID_POSITION",
            distanceMeters: null,
            positionValid: false,
            timeValid: null,
            notes: "Foto tidak memiliki metadata koordinat GPS. Unggah foto yang menyertakan lokasi (EXIF GPS).",
        };
    }

    if (input.targetLat == null || input.targetLng == null) {
        return {
            validityStatus: "INVALID_POSITION",
            distanceMeters: null,
            positionValid: false,
            timeValid: null,
            notes: `Koordinat ${target} belum diisi — jarak foto tidak dapat diverifikasi.`,
        };
    }

    const km = haversineDistance(
        input.targetLat,
        input.targetLng,
        input.photoLat,
        input.photoLng,
    );
    const distanceMeters = Math.round(km * 1000);
    const positionValid = distanceMeters <= tolerance;

    const timeValid =
        input.capturedAt && input.uploadedAt
            ? input.capturedAt.getTime() <=
              input.uploadedAt.getTime() + PHOTO_CAPTURE_SKEW_MS
            : null;

    if (!positionValid) {
        return {
            validityStatus: "INVALID_POSITION",
            distanceMeters,
            positionValid,
            timeValid,
            notes: `Foto berjarak ${distanceMeters} m dari ${target} — melebihi toleransi ${tolerance} m.`,
        };
    }

    if (timeValid === false) {
        return {
            validityStatus: "INVALID_TIME",
            distanceMeters,
            positionValid,
            timeValid,
            notes: "Waktu perekaman foto lebih baru daripada waktu unggah.",
        };
    }

    return {
        validityStatus: "VALID",
        distanceMeters,
        positionValid,
        timeValid,
        notes: `Foto sesuai dengan lokasi (${distanceMeters} m dari ${target}).`,
    };
}
