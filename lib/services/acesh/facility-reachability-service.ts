import { prisma } from "@/lib/prisma";
import { parseCoordinate } from "@/lib/maps/geo-utils";
import { defaultTravelModeForType } from "./constants";
import { estimateTravelTime } from "./travel-time-service";
import {
    evaluateFacilityReachability,
    resolveFacilityReachabilityKey,
    summarizeEvidence,
    type FacilityReachabilityLive,
    type FacilityReachabilityRow,
    type ReachabilityConfigLike,
    type TravelMode,
} from "@/lib/facilities/facility-reachability";

type EstimateTravelTimeFn = (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    mode: TravelMode,
) => Promise<{
    distanceMeters: number;
    travelMinutes: number;
    travelMode: string;
    source: "ROUTING" | "ESTIMATION";
}>;

export interface ReachabilityDestinationInput {
    latitude: unknown;
    longitude: unknown;
    destinationHalalFacilities: Array<{
        id: string;
        latitude: number | null;
        longitude: number | null;
        distanceMeters: number | null;
        travelMinutes: number | null;
        travelMode: string | null;
        facility: {
            name: string;
            facilityType: string | null;
            latitude: unknown;
            longitude: unknown;
        } | null;
        evidences: Array<{ validityStatus: string }> | null;
    }>;
}

const LIVE_METRIC_CONCURRENCY = 5;

/**
 * Recomputes distance and travel time for every facility linked to a
 * destination. Reads happen on demand; nothing is written back to the DB.
 */
export async function getDestinationFacilityReachability(
    destinationId: string,
): Promise<FacilityReachabilityRow[] | null> {
    const [destination, configs] = await Promise.all([
        prisma.destination.findUnique({
            where: { id: destinationId },
            select: {
                latitude: true,
                longitude: true,
                destinationHalalFacilities: {
                    select: {
                        id: true,
                        latitude: true,
                        longitude: true,
                        distanceMeters: true,
                        travelMinutes: true,
                        travelMode: true,
                        facility: {
                            select: {
                                name: true,
                                facilityType: true,
                                latitude: true,
                                longitude: true,
                            },
                        },
                        evidences: {
                            select: { validityStatus: true },
                        },
                    },
                },
            },
        }),
        prisma.reachabilityConfig.findMany({
            select: {
                facilityType: true,
                label: true,
                maxDistanceMeters: true,
                maxTravelMinutes: true,
                travelMode: true,
                isActive: true,
            },
        }),
    ]);

    if (!destination) return null;
    return buildLiveFacilityRows(destination, configs);
}

export async function buildLiveFacilityRows(
    destination: ReachabilityDestinationInput,
    configs: ReachabilityConfigLike[] = [],
    estimateFn: EstimateTravelTimeFn = estimateTravelTime,
): Promise<FacilityReachabilityRow[]> {
    const destinationLat = parseCoordinate(destination.latitude);
    const destinationLng = parseCoordinate(destination.longitude);

    const rows = await mapWithConcurrency(
        destination.destinationHalalFacilities,
        LIVE_METRIC_CONCURRENCY,
        async (facility) => {
            const facilityLat = parseCoordinate(
                facility.latitude ?? facility.facility?.latitude,
            );
            const facilityLng = parseCoordinate(
                facility.longitude ?? facility.facility?.longitude,
            );
            const reachabilityKey = resolveFacilityReachabilityKey(
                facility.facility?.facilityType,
                facility.facility?.name,
            );
            const matchedConfig = reachabilityKey
                ? configs.find(
                      (config) =>
                          config.isActive &&
                          config.facilityType.trim().toUpperCase() === reachabilityKey,
                  )
                : undefined;
            const travelMode: TravelMode =
                (matchedConfig?.travelMode as TravelMode | undefined) ??
                (facility.travelMode as TravelMode | null) ??
                defaultTravelModeForType(facility.facility?.facilityType);
            const reachability = (metrics: {
                distanceMeters: number | null;
                travelMinutes: number | null;
            }) =>
                evaluateFacilityReachability(
                    metrics,
                    configs,
                    facility.facility?.facilityType,
                    facility.facility?.name,
                );

            const baseRow: FacilityReachabilityRow = {
                id: facility.id,
                facilityName: facility.facility?.name ?? "Fasilitas",
                facilityType: facility.facility?.facilityType ?? null,
                latitude: facilityLat,
                longitude: facilityLng,
                stored: {
                    distanceMeters: facility.distanceMeters ?? null,
                    travelMinutes: facility.travelMinutes ?? null,
                    travelMode: facility.travelMode ?? null,
                },
                live: null,
                liveReason: null,
                evidence: summarizeEvidence(facility.evidences),
                reachability: reachability({
                    distanceMeters: null,
                    travelMinutes: null,
                }),
            };

            if (destinationLat === null || destinationLng === null) {
                return {
                    ...baseRow,
                    liveReason: "Koordinat destinasi belum diisi.",
                };
            }

            if (facilityLat === null || facilityLng === null) {
                return {
                    ...baseRow,
                    liveReason: "Koordinat fasilitas belum diisi.",
                };
            }

            try {
                const result = await estimateFn(
                    destinationLat,
                    destinationLng,
                    facilityLat,
                    facilityLng,
                    travelMode,
                );
                const live: FacilityReachabilityLive = {
                    distanceMeters: result.distanceMeters,
                    travelMinutes: result.travelMinutes,
                    travelMode: result.travelMode,
                    source: result.source,
                };
                return {
                    ...baseRow,
                    live,
                    reachability: reachability({
                        distanceMeters: result.distanceMeters,
                        travelMinutes: result.travelMinutes,
                    }),
                };
            } catch {
                return {
                    ...baseRow,
                    liveReason: "Gagal menghitung jarak dan waktu tempuh.",
                };
            }
        },
    );

    return rows.sort((a, b) => a.facilityName.localeCompare(b.facilityName));
}

async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    task: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const current = nextIndex++;
            results[current] = await task(items[current]);
        }
    }

    const workers = Array.from(
        { length: Math.min(limit, items.length) },
        () => worker(),
    );
    await Promise.all(workers);
    return results;
}
