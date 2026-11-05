/**
 * Pure helpers for turning coverage area GeoJSON into map bounds.
 * No Leaflet dependency so the functions stay testable in Node.
 */

export interface CoverageAreaSummary {
    id: string;
    name: string;
    level: string;
    geoJsonData: unknown;
    colorHex: string | null;
}

export interface BoundsLiteral {
    south: number;
    west: number;
    north: number;
    east: number;
}

export interface CoverageFeatureProperties {
    id: string;
    name: string;
    level: string;
    colorHex: string | null;
    [key: string]: unknown;
}

export interface CoverageFeature {
    type: "Feature";
    properties: CoverageFeatureProperties;
    geometry: unknown;
}

export interface CoverageFeatureCollection {
    type: "FeatureCollection";
    features: CoverageFeature[];
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function expandBounds(
    acc: BoundsLiteral | null,
    lat: number,
    lng: number,
): BoundsLiteral | null {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return acc;
    if (!acc) return { south: lat, north: lat, west: lng, east: lng };
    return {
        south: Math.min(acc.south, lat),
        north: Math.max(acc.north, lat),
        west: Math.min(acc.west, lng),
        east: Math.max(acc.east, lng),
    };
}

/**
 * Walks GeoJSON-ish structures and accumulates the coordinate envelope.
 * Coordinate tuples are [lng, lat] per the GeoJSON spec.
 */
function collectBounds(
    node: unknown,
    acc: BoundsLiteral | null,
): BoundsLiteral | null {
    if (!node || typeof node !== "object") return acc;

    if (Array.isArray(node)) {
        if (
            node.length >= 2 &&
            isFiniteNumber(node[0]) &&
            isFiniteNumber(node[1])
        ) {
            return expandBounds(acc, node[1], node[0]);
        }

        let next = acc;
        for (const child of node) {
            next = collectBounds(child, next);
        }
        return next;
    }

    const object = node as Record<string, unknown>;
    if (Array.isArray(object.features)) {
        return collectBounds(object.features, acc);
    }
    if (Array.isArray(object.geometries)) {
        return collectBounds(object.geometries, acc);
    }
    if (object.geometry) {
        return collectBounds(object.geometry, acc);
    }
    if (object.coordinates !== undefined) {
        return collectBounds(object.coordinates, acc);
    }

    return acc;
}

/**
 * Returns the lat/lng envelope for a GeoJSON object, or null when the data
 * has no usable coordinates (e.g. the empty `{}` written by old seed data).
 */
export function getGeoJsonBounds(data: unknown): BoundsLiteral | null {
    return collectBounds(data, null);
}

export function unionBounds(
    boundsList: Array<BoundsLiteral | null | undefined>,
): BoundsLiteral | null {
    let result: BoundsLiteral | null = null;
    for (const bounds of boundsList) {
        if (!bounds) continue;
        result = result
            ? {
                  south: Math.min(result.south, bounds.south),
                  north: Math.max(result.north, bounds.north),
                  west: Math.min(result.west, bounds.west),
                  east: Math.max(result.east, bounds.east),
              }
            : bounds;
    }
    return result;
}

export function getActiveCoverageBounds(
    areas: CoverageAreaSummary[],
): BoundsLiteral | null {
    return unionBounds(areas.map((area) => getGeoJsonBounds(area.geoJsonData)));
}

function extractFeatures(data: unknown): Array<Record<string, unknown>> {
    if (!data || typeof data !== "object") return [];
    const object = data as Record<string, unknown>;

    if (object.type === "FeatureCollection" && Array.isArray(object.features)) {
        return object.features.filter(
            (feature): feature is Record<string, unknown> =>
                !!feature && typeof feature === "object",
        );
    }

    if (object.type === "Feature" && object.geometry) {
        return [object];
    }

    if (typeof object.type === "string") {
        return [{ type: "Feature", properties: {}, geometry: object }];
    }

    return [];
}

/**
 * Normalizes every active area into a single FeatureCollection so Leaflet can
 * style each region with its own colour. Invalid geometry is skipped.
 */
export function toCoverageFeatureCollection(
    areas: CoverageAreaSummary[],
): CoverageFeatureCollection | null {
    const features: CoverageFeature[] = [];

    for (const area of areas) {
        for (const raw of extractFeatures(area.geoJsonData)) {
            const geometry = raw.geometry;
            if (!getGeoJsonBounds(geometry)) continue;

            const rawProperties =
                raw.properties && typeof raw.properties === "object"
                    ? (raw.properties as Record<string, unknown>)
                    : {};

            features.push({
                type: "Feature",
                properties: {
                    ...rawProperties,
                    id: area.id,
                    name: area.name,
                    level: area.level,
                    colorHex: area.colorHex,
                },
                geometry,
            });
        }
    }

    if (features.length === 0) return null;
    return { type: "FeatureCollection", features };
}
