import { haversineDistance } from "@/lib/utils/haversine-distance";
import { TRAVEL_SPEED_KMH } from "./constants";
import type { AceshTravelMode } from "@/lib/generated/prisma";

export interface TravelTimeResult {
    distanceMeters: number;
    travelMinutes: number;
    travelMode: AceshTravelMode;
    /** ROUTING when an OSRM server was used, ESTIMATION for the speed-based fallback. */
    source: "ROUTING" | "ESTIMATION";
}

export interface TravelTimeServiceOptions {
    /** OSRM table endpoint base URL, e.g. https://router.project-osrm.org */
    osrmBaseUrl?: string;
    /** Fetch implementation (injectable for tests). */
    fetchFn?: typeof fetch;
    /** Timeout in ms for OSRM calls (default 3000). */
    timeoutMs?: number;
}

export const DEFAULT_TRAVEL_TIME_OPTIONS: TravelTimeServiceOptions = {
    osrmBaseUrl: process.env.OSRM_BASE_URL ?? undefined,
    timeoutMs: 3000,
};

function parseCoordinate(value: number | null | undefined): number | null {
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    return value;
}

/**
 * Estimates travel time using the OSRM routing service when available,
 * otherwise falls back to straight-line distance and per-mode speed.
 *
 * The source is always explicit (ROUTING | ESTIMATION).
 */
export async function estimateTravelTime(
    fromLat: number | null | undefined,
    fromLng: number | null | undefined,
    toLat: number | null | undefined,
    toLng: number | null | undefined,
    travelMode: AceshTravelMode = "WALKING",
    options: TravelTimeServiceOptions = DEFAULT_TRAVEL_TIME_OPTIONS,
): Promise<TravelTimeResult> {
    const start = { lat: parseCoordinate(fromLat), lng: parseCoordinate(fromLng) };
    const end = { lat: parseCoordinate(toLat), lng: parseCoordinate(toLng) };

    if (!start.lat || !start.lng || !end.lat || !end.lng) {
        throw new Error("Koordinat asal dan tujuan wajib diisi untuk estimasi waktu tempuh");
    }

    const distanceKm = haversineDistance(start.lat, start.lng, end.lat, end.lng);
    const distanceMeters = Math.round(distanceKm * 1000);

    if (options.osrmBaseUrl) {
        try {
            const result = await requestOsrmRoute(
                options.osrmBaseUrl,
                start.lat,
                start.lng,
                end.lat,
                end.lng,
                travelMode,
                options.fetchFn,
                options.timeoutMs ?? 3000,
            );
            if (result) return result;
        } catch {
            // fall through to estimation
        }
    }

    const speedKmh = TRAVEL_SPEED_KMH[travelMode] ?? TRAVEL_SPEED_KMH.WALKING;
    const travelMinutes = Math.max(1, Math.ceil((distanceKm / speedKmh) * 60));

    return {
        distanceMeters,
        travelMinutes,
        travelMode,
        source: "ESTIMATION",
    };
}

async function requestOsrmRoute(
    baseUrl: string,
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    travelMode: AceshTravelMode,
    fetchFn: typeof fetch = fetch,
    timeoutMs: number,
): Promise<TravelTimeResult | null> {
    const profile =
        travelMode === "DRIVING" ? "driving" : travelMode === "CYCLING" ? "cycling" : "foot";

    const url =
        `${baseUrl.replace(/\/$/, "")}/route/v1/${profile}/` +
        `${fromLng},${fromLat};${toLng},${toLat}?overview=false&steps=false`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchFn(url, { signal: controller.signal });
        if (!response.ok) return null;
        const data = (await response.json()) as {
            code?: string;
            routes?: Array<{ duration?: number; distance?: number }>;
        };
        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) return null;

        const route = data.routes[0];
        const durationSeconds = route.duration ?? 0;
        const distanceMeters = Math.round(route.distance ?? 0);

        return {
            distanceMeters,
            travelMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
            travelMode,
            source: "ROUTING",
        };
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}
