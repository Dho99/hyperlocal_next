/**
 * Pure polygon helpers for the coverage area filter.
 *
 * Visibility rules:
 * - No coverage areas configured -> everything is visible (bootstrap).
 * - A point inside a disabled area is always hidden, even when it is also
 *   inside an active parent area (Kabupaten Pangandaran vs Jawa Barat).
 * - Otherwise a point is visible only when it falls inside an active area.
 * - Points outside every area are hidden.
 *
 * No Leaflet dependency so the same code runs on the server and in tests.
 */

export interface CoverageAreaGeometry {
    id: string;
    name?: string | null;
    level?: string | null;
    isActive: boolean;
    geoJsonData: unknown;
}

export interface CoverageBounds {
    south: number;
    north: number;
    west: number;
    east: number;
}

export interface CoveragePolygon {
    bbox: CoverageBounds;
    /** rings[0] is the outer ring, the rest are holes. Points are [lng, lat]. */
    rings: Array<Array<[number, number]>>;
    /** Approximate polygon area (deg²), used to pick the most specific area. */
    area: number;
}

export interface CoverageAreaEntry {
    areaId: string;
    isActive: boolean;
    polygons: CoveragePolygon[];
}

export interface CoverageIndex {
    hasAreas: boolean;
    entries: CoverageAreaEntry[];
    activePolygons: CoveragePolygon[];
    inactivePolygons: CoveragePolygon[];
}

/** Normalizes a DB coordinate (number, numeric string, Decimal) to a number. */
export function toCoordinate(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed =
        typeof value === "number"
            ? value
            : typeof value === "string"
              ? Number(value)
              : Number(value as number);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseRing(value: unknown): Array<[number, number]> | null {
    if (!Array.isArray(value)) return null;
    const points: Array<[number, number]> = [];

    for (const item of value) {
        if (!Array.isArray(item) || item.length < 2) continue;
        const lng = toCoordinate(item[0]);
        const lat = toCoordinate(item[1]);
        if (lng === null || lat === null) continue;
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) continue;
        points.push([lng, lat]);
    }

    return points.length >= 3 ? points : null;
}

function getBounds(rings: Array<Array<[number, number]>>): CoverageBounds {
    let south = Infinity;
    let north = -Infinity;
    let west = Infinity;
    let east = -Infinity;

    for (const ring of rings) {
        for (const [lng, lat] of ring) {
            south = Math.min(south, lat);
            north = Math.max(north, lat);
            west = Math.min(west, lng);
            east = Math.max(east, lng);
        }
    }

    return { south, north, west, east };
}

function ringArea(ring: Array<[number, number]>): number {
    let sum = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    }
    return Math.abs(sum / 2);
}

function polygonArea(rings: Array<Array<[number, number]>>): number {
    const outer = ringArea(rings[0]);
    const holes = rings
        .slice(1)
        .reduce((total, ring) => total + ringArea(ring), 0);
    return Math.max(outer - holes, 0);
}

function parsePolygonCoordinates(
    value: unknown,
    output: CoveragePolygon[],
): void {
    if (!Array.isArray(value)) return;

    const rings: Array<Array<[number, number]>> = [];
    for (const ringValue of value) {
        const ring = parseRing(ringValue);
        if (ring) rings.push(ring);
    }

    if (rings.length === 0) return;
    output.push({
        rings,
        bbox: getBounds(rings),
        area: polygonArea(rings),
    });
}

function collectPolygons(node: unknown, output: CoveragePolygon[]): void {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
        for (const child of node) collectPolygons(child, output);
        return;
    }

    const object = node as Record<string, unknown>;

    if (Array.isArray(object.features)) {
        for (const feature of object.features) collectPolygons(feature, output);
        return;
    }

    if (Array.isArray(object.geometries)) {
        for (const geometry of object.geometries) {
            collectPolygons(geometry, output);
        }
        return;
    }

    if (object.geometry) {
        collectPolygons(object.geometry, output);
        return;
    }

    if (object.type === "Polygon") {
        parsePolygonCoordinates(object.coordinates, output);
        return;
    }

    if (object.type === "MultiPolygon" && Array.isArray(object.coordinates)) {
        for (const polygon of object.coordinates) {
            parsePolygonCoordinates(polygon, output);
        }
        return;
    }

    if (object.coordinates !== undefined) {
        parsePolygonCoordinates(object.coordinates, output);
    }
}

/** Extracts valid polygons from one coverage area's GeoJSON. */
export function getAreaPolygons(area: CoverageAreaGeometry): CoveragePolygon[] {
    const polygons: CoveragePolygon[] = [];
    collectPolygons(area.geoJsonData, polygons);
    return polygons;
}

export function buildCoverageIndex(
    areas: CoverageAreaGeometry[],
): CoverageIndex {
    const activePolygons: CoveragePolygon[] = [];
    const inactivePolygons: CoveragePolygon[] = [];
    const entries: CoverageAreaEntry[] = [];

    for (const area of areas) {
        const polygons = getAreaPolygons(area);
        entries.push({ areaId: area.id, isActive: area.isActive, polygons });

        const target = area.isActive ? activePolygons : inactivePolygons;
        target.push(...polygons);
    }

    return {
        hasAreas: areas.length > 0,
        entries,
        activePolygons,
        inactivePolygons,
    };
}

function pointInRing(
    lng: number,
    lat: number,
    ring: Array<[number, number]>,
): boolean {
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        const intersects =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
    }

    return inside;
}

export function pointInPolygon(
    lng: number,
    lat: number,
    polygon: CoveragePolygon,
): boolean {
    const { bbox, rings } = polygon;
    if (
        lat < bbox.south ||
        lat > bbox.north ||
        lng < bbox.west ||
        lng > bbox.east
    ) {
        return false;
    }

    if (!pointInRing(lng, lat, rings[0])) return false;

    for (let i = 1; i < rings.length; i++) {
        if (pointInRing(lng, lat, rings[i])) return false;
    }

    return true;
}

function pointInAnyPolygon(
    lng: number,
    lat: number,
    polygons: CoveragePolygon[],
): boolean {
    return polygons.some((polygon) => pointInPolygon(lng, lat, polygon));
}

/**
 * Finds the most specific area containing the point (smallest polygon area
 * among the matches). Nested areas therefore win over their parents.
 */
export function resolveCoverageArea(
    lng: number,
    lat: number,
    index: CoverageIndex,
): CoverageAreaEntry | null {
    let winner: CoverageAreaEntry | null = null;
    let winnerArea = Infinity;

    for (const entry of index.entries) {
        for (const polygon of entry.polygons) {
            if (polygon.area >= winnerArea) continue;
            if (!pointInPolygon(lng, lat, polygon)) continue;
            winner = entry;
            winnerArea = polygon.area;
        }
    }

    return winner;
}

/**
 * True when the most specific area containing the point is disabled.
 * A disabled child hides its points even when a parent area is active.
 */
export function isPointInInactiveCoverage(
    lng: number,
    lat: number,
    index: CoverageIndex,
): boolean {
    const winner = resolveCoverageArea(lng, lat, index);
    return winner !== null && !winner.isActive;
}

/** True when the point sits inside the given area's polygons. */
export function isPointInArea(
    lng: number,
    lat: number,
    area: CoverageAreaGeometry,
): boolean {
    return pointInAnyPolygon(lng, lat, getAreaPolygons(area));
}

/**
 * Resolves visibility for a coordinate using the active/inactive polygons.
 * Used by the public map endpoints.
 */
export function isCoveragePointVisible(
    lng: number,
    lat: number,
    index: CoverageIndex,
): boolean {
    if (!index.hasAreas) return true;
    const winner = resolveCoverageArea(lng, lat, index);
    return winner !== null && winner.isActive;
}

interface CoordinateLike {
    latitude?: unknown;
    longitude?: unknown;
}

export function isCoordinateVisible(
    item: CoordinateLike,
    index: CoverageIndex,
): boolean {
    if (!index.hasAreas) return true;

    const lng = toCoordinate(item.longitude);
    const lat = toCoordinate(item.latitude);
    if (lng === null || lat === null) return false;

    return isCoveragePointVisible(lng, lat, index);
}

/**
 * Filters destinations by the coverage rule. When no areas are configured the
 * input is returned untouched so the map keeps working before setup.
 */
export function filterDestinationsByCoverage<T extends CoordinateLike>(
    items: T[],
    index: CoverageIndex,
): T[] {
    if (!index.hasAreas) return items;
    return items.filter((item) => isCoordinateVisible(item, index));
}
