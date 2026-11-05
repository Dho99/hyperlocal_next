import { prisma } from "@/lib/prisma";
import {
    buildCoverageIndex,
    type CoverageAreaGeometry,
    type CoverageIndex,
} from "@/lib/maps/coverage-geometry";

const CACHE_TTL_MS = 60_000;

let areaCache: { expiresAt: number; areas: CoverageAreaGeometry[] } | null =
    null;
let indexCache: {
    areas: CoverageAreaGeometry[];
    index: CoverageIndex;
} | null = null;

/**
 * All coverage areas (active and inactive). The map filter needs the inactive
 * polygons to hide their regions even when a parent area is still active.
 */
export async function getAllCoverageAreas(): Promise<CoverageAreaGeometry[]> {
    const now = Date.now();
    if (areaCache && areaCache.expiresAt > now) return areaCache.areas;

    const areas = await prisma.coverageArea.findMany({
        select: {
            id: true,
            name: true,
            level: true,
            isActive: true,
            geoJsonData: true,
        },
    });

    areaCache = { expiresAt: now + CACHE_TTL_MS, areas };
    return areas;
}

export async function getCoverageIndex(): Promise<CoverageIndex> {
    const areas = await getAllCoverageAreas();
    if (indexCache && indexCache.areas === areas) return indexCache.index;

    const index = buildCoverageIndex(areas);
    indexCache = { areas, index };
    return index;
}

/** Called by the admin coverage-area mutations so toggles apply immediately. */
export function clearCoverageAreaCache(): void {
    areaCache = null;
    indexCache = null;
}
