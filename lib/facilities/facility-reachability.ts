export type TravelMode = "WALKING" | "DRIVING" | "CYCLING";

export interface FacilityReachabilityStored {
    distanceMeters: number | null;
    travelMinutes: number | null;
    travelMode: string | null;
}

export interface FacilityReachabilityLive extends FacilityReachabilityStored {
    source: "ROUTING" | "ESTIMATION" | null;
}

export interface FacilityEvidenceSummary {
    total: number;
    valid: number;
    invalidPosition: number;
    invalidTime: number;
    noMetadata: number;
    pending: number;
}

export type ReachabilityStatus =
    | "WITHIN"
    | "OUTSIDE_DISTANCE"
    | "OUTSIDE_TIME"
    | "OUTSIDE_BOTH"
    | "NO_CONFIG"
    | "UNKNOWN";

export interface ReachabilityConfigLike {
    facilityType: string;
    label: string | null;
    maxDistanceMeters: number | null;
    maxTravelMinutes: number | null;
    travelMode: string;
    isActive: boolean;
}

export interface FacilityThreshold {
    key: string;
    label: string | null;
    maxDistanceMeters: number | null;
    maxTravelMinutes: number | null;
    travelMode: string;
}

export interface FacilityReachabilityEvaluation {
    status: ReachabilityStatus;
    withinDistance: boolean | null;
    withinTime: boolean | null;
    threshold: FacilityThreshold | null;
}

export interface FacilityReachabilityRow {
    id: string;
    facilityName: string;
    facilityType: string | null;
    latitude: number | null;
    longitude: number | null;
    stored: FacilityReachabilityStored;
    live: FacilityReachabilityLive | null;
    liveReason: string | null;
    evidence: FacilityEvidenceSummary;
    reachability: FacilityReachabilityEvaluation;
}

export interface StoredFacilityInput {
    id: string;
    latitude: number | null;
    longitude: number | null;
    distanceMeters: number | null;
    travelMinutes: number | null;
    travelMode: string | null;
    facility: {
        name: string;
        facilityType: string | null;
        latitude?: number | null;
        longitude?: number | null;
    } | null;
    evidences?: Array<{ validityStatus: string }> | null;
}

/** Summarizes photo-evidence validity statuses for one destination facility. */
export function summarizeEvidence(
    evidences: Array<{ validityStatus: string }> | null | undefined,
): FacilityEvidenceSummary {
    const rows = evidences ?? [];
    const count = (status: string) =>
        rows.filter((evidence) => evidence.validityStatus === status).length;

    return {
        total: rows.length,
        valid: count("VALID"),
        invalidPosition: count("INVALID_POSITION"),
        invalidTime: count("INVALID_TIME"),
        noMetadata: count("NO_METADATA"),
        pending: count("PENDING"),
    };
}

const FACILITY_TYPE_ALIASES: Record<string, string> = {
    MOSQUE: "MOSQUE",
    MASJID: "MOSQUE",
    MUSALA: "MUSALA",
    MUSHOLA: "MUSALA",
    MUSHOLLA: "MUSALA",
    SURAU: "MUSALA",
    RESTAURANT: "RESTAURANT",
    RESTORAN: "RESTAURANT",
    HALAL_FOOD: "HALAL_FOOD",
    KULINER: "KULINER",
    FOOD: "HALAL_FOOD",
    LODGING: "LODGING",
    HOTEL: "LODGING",
    PENGINAPAN: "PENGINAPAN",
    ACCOMMODATION: "LODGING",
};

/**
 * Maps the master facility type (which may be `religious`, `worship`, etc.) to
 * the canonical key used by reachability_configs. Ambiguous worship entries
 * fall back to the facility name; unknown combinations return null.
 */
export function resolveFacilityReachabilityKey(
    facilityType: string | null | undefined,
    facilityName: string | null | undefined,
): string | null {
    const raw = (facilityType ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (!raw) return null;

    const aliased = FACILITY_TYPE_ALIASES[raw];
    if (aliased) return aliased;

    if (raw === "RELIGIOUS" || raw === "WORSHIP" || raw === "IBADAH") {
        const name = (facilityName ?? "").toLowerCase();
        if (/(musala|musholla|mushola|surau)/.test(name)) return "MUSALA";
        if (/(masjid|mosque)/.test(name)) return "MOSQUE";
    }

    return null;
}

export function evaluateFacilityReachability(
    metrics: { distanceMeters: number | null; travelMinutes: number | null },
    configs: ReachabilityConfigLike[],
    facilityType: string | null | undefined,
    facilityName: string | null | undefined,
): FacilityReachabilityEvaluation {
    const key = resolveFacilityReachabilityKey(facilityType, facilityName);
    const config = key
        ? configs.find(
              (item) =>
                  item.isActive &&
                  item.facilityType.trim().toUpperCase() === key,
          )
        : undefined;

    if (!config) {
        return {
            status: "NO_CONFIG",
            withinDistance: null,
            withinTime: null,
            threshold: null,
        };
    }

    const threshold: FacilityThreshold = {
        key: key ?? config.facilityType,
        label: config.label,
        maxDistanceMeters: config.maxDistanceMeters,
        maxTravelMinutes: config.maxTravelMinutes,
        travelMode: config.travelMode,
    };

    if (metrics.distanceMeters == null || metrics.travelMinutes == null) {
        return {
            status: "UNKNOWN",
            withinDistance: null,
            withinTime: null,
            threshold,
        };
    }

    const withinDistance =
        config.maxDistanceMeters == null ||
        config.maxDistanceMeters <= 0 ||
        metrics.distanceMeters <= config.maxDistanceMeters;
    const withinTime =
        config.maxTravelMinutes == null ||
        config.maxTravelMinutes <= 0 ||
        metrics.travelMinutes <= config.maxTravelMinutes;

    const status: ReachabilityStatus =
        withinDistance && withinTime
            ? "WITHIN"
            : withinDistance
              ? "OUTSIDE_TIME"
              : withinTime
                ? "OUTSIDE_DISTANCE"
                : "OUTSIDE_BOTH";

    return {
        status,
        withinDistance,
        withinTime,
        threshold,
    };
}

/**
 * Maps stored location metrics into display rows. Used as the fallback when the
 * live reachability endpoint is unavailable.
 */
export function storedFacilityRows(
    facilities: StoredFacilityInput[],
): FacilityReachabilityRow[] {
    return facilities
        .map((facility): FacilityReachabilityRow => {
            const latitude = facility.latitude ?? facility.facility?.latitude ?? null;
            const longitude = facility.longitude ?? facility.facility?.longitude ?? null;
            return {
                id: facility.id,
                facilityName: facility.facility?.name ?? "Fasilitas",
                facilityType: facility.facility?.facilityType ?? null,
                latitude,
                longitude,
                stored: {
                    distanceMeters: facility.distanceMeters ?? null,
                    travelMinutes: facility.travelMinutes ?? null,
                    travelMode: facility.travelMode ?? null,
                },
                live: null,
                liveReason: "Nilai aktual belum dimuat.",
                evidence: summarizeEvidence(facility.evidences),
                reachability: {
                    status: "UNKNOWN",
                    withinDistance: null,
                    withinTime: null,
                    threshold: null,
                },
            };
        })
        .sort((a, b) => a.facilityName.localeCompare(b.facilityName));
}
