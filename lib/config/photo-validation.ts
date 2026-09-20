/** Default position tolerance (meters) when a facility has no override. */
export const DEFAULT_PHOTO_TOLERANCE_METERS = 100;

/** Allowed clock skew between capture time and upload time (ms). */
export const PHOTO_CAPTURE_SKEW_MS = 5 * 60 * 1000;

export type PhotoValidityStatusValue =
    | "PENDING"
    | "VALID"
    | "INVALID_POSITION"
    | "INVALID_TIME"
    | "NO_METADATA";

export const PHOTO_VALIDITY_LABELS: Record<
    PhotoValidityStatusValue,
    string
> = {
    PENDING: "Belum diperiksa",
    VALID: "Valid",
    INVALID_POSITION: "Di luar radius",
    INVALID_TIME: "Waktu tidak wajar",
    NO_METADATA: "Tanpa metadata",
};

export const PHOTO_VALIDITY_STYLES: Record<
    PhotoValidityStatusValue,
    string
> = {
    PENDING: "bg-muted text-muted-foreground",
    VALID: "bg-emerald-100 text-emerald-800",
    INVALID_POSITION: "bg-red-100 text-red-800",
    INVALID_TIME: "bg-orange-100 text-orange-800",
    NO_METADATA: "bg-amber-100 text-amber-800",
};

export function formatDistanceMeters(meters: number | null | undefined): string {
    if (meters == null) return "—";
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(2)} km`;
}

/** Statuses that must block submission (server + client agree). */
export const BLOCKING_PHOTO_STATUSES: PhotoValidityStatusValue[] = [
    "INVALID_POSITION",
    "INVALID_TIME",
];

export function isBlockingPhotoStatus(
    status?: string | null,
): boolean {
    return (
        !!status &&
        BLOCKING_PHOTO_STATUSES.includes(status as PhotoValidityStatusValue)
    );
}
