import { prisma } from "@/lib/prisma";
import type { AceshTravelMode, ReachabilityConfig } from "@/lib/generated/prisma";
import { DEFAULT_REACHABILITY } from "./constants";

export interface ReachabilityParams {
    maxDistanceMeters?: number | null;
    maxTravelMinutes?: number | null;
    travelMode?: AceshTravelMode | null;
}

export interface ReachabilityResult {
    withinDistance: boolean;
    withinTime: boolean;
    reachable: boolean;
    params: ReachabilityParams;
}

/** Reads the reachability configuration for a facility type (DB first, fallback defaults). */
export async function getReachabilityConfig(
    facilityType: string | null | undefined,
): Promise<ReachabilityParams> {
    const normalized = normalizeFacilityType(facilityType);

    const stored = await prisma.reachabilityConfig.findUnique({
        where: { facilityType: normalized },
    });
    if (stored) return toParams(stored);

    const fallback = DEFAULT_REACHABILITY[normalized];
    return fallback
        ? {
              maxDistanceMeters: fallback.maxDistanceMeters,
              maxTravelMinutes: fallback.maxTravelMinutes,
              travelMode: fallback.travelMode,
          }
        : { maxDistanceMeters: null, maxTravelMinutes: null, travelMode: null };
}

/** Reads all active reachability configurations. */
export async function listReachabilityConfigs(): Promise<ReachabilityConfig[]> {
    return prisma.reachabilityConfig.findMany({
        orderBy: { facilityType: "asc" },
    });
}

export function normalizeFacilityType(type: string | null | undefined): string {
    return (type ?? "").trim().toUpperCase();
}

/**
 * Checks whether a facility meets the reachability parameters of its type.
 * When no limit is configured the constraint is considered satisfied.
 */
export function checkReachability(
    distanceMeters: number | null | undefined,
    travelMinutes: number | null | undefined,
    params: ReachabilityParams,
): ReachabilityResult {
    const withinDistance =
        params.maxDistanceMeters == null ||
        params.maxDistanceMeters <= 0 ||
        (distanceMeters != null && distanceMeters <= params.maxDistanceMeters);
    const withinTime =
        params.maxTravelMinutes == null ||
        params.maxTravelMinutes <= 0 ||
        (travelMinutes != null && travelMinutes <= params.maxTravelMinutes);

    return {
        withinDistance,
        withinTime,
        reachable: withinDistance && withinTime,
        params,
    };
}

function toParams(config: ReachabilityConfig): ReachabilityParams {
    return {
        maxDistanceMeters: config.maxDistanceMeters,
        maxTravelMinutes: config.maxTravelMinutes,
        travelMode: config.travelMode,
    };
}
