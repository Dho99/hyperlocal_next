import { describe, expect, it } from "vitest";
import {
    buildCoverageIndex,
    filterDestinationsByCoverage,
    getAreaPolygons,
    isCoordinateVisible,
    isCoveragePointVisible,
    isPointInInactiveCoverage,
    pointInPolygon,
    toCoordinate,
    type CoverageAreaGeometry,
} from "@/lib/maps/coverage-geometry";

function square(
    west: number,
    south: number,
    east: number,
    north: number,
): GeoJSON.Polygon {
    return {
        type: "Polygon",
        coordinates: [
            [
                [west, south],
                [east, south],
                [east, north],
                [west, north],
                [west, south],
            ],
        ],
    };
}

function feature(geometry: GeoJSON.Polygon) {
    return { type: "Feature", properties: {}, geometry };
}

function area(
    id: string,
    isActive: boolean,
    geoJsonData: unknown,
): CoverageAreaGeometry {
    return { id, name: id, level: "REGIONAL", isActive, geoJsonData };
}

const PANGANDARAN = square(108.31, -7.83, 108.81, -7.46);
const JAWA_BARAT = square(106.05, -8.03, 109.07, -4.03);

describe("pointInPolygon", () => {
    it("detects a point inside the outer ring", () => {
        const [polygon] = getAreaPolygons(area("a", true, feature(PANGANDARAN)));
        expect(pointInPolygon(108.5, -7.7, polygon)).toBe(true);
    });

    it("rejects a point outside the polygon", () => {
        const [polygon] = getAreaPolygons(area("a", true, feature(PANGANDARAN)));
        expect(pointInPolygon(107.0, -7.7, polygon)).toBe(false);
    });

    it("treats the first inner ring as a hole", () => {
        const polygon: GeoJSON.Polygon = {
            type: "Polygon",
            coordinates: [
                square(0, 0, 10, 10).coordinates[0],
                square(4, 4, 6, 6).coordinates[0],
            ],
        };
        const [parsed] = getAreaPolygons(area("hole", true, polygon));
        expect(pointInPolygon(5, 5, parsed)).toBe(false);
        expect(pointInPolygon(2, 2, parsed)).toBe(true);
    });
});

describe("coverage visibility", () => {
    it("shows everything when no coverage area is configured", () => {
        const index = buildCoverageIndex([]);
        expect(
            filterDestinationsByCoverage(
                [
                    { id: "any", latitude: 10, longitude: 10 },
                    { id: "null", latitude: null, longitude: null },
                ],
                index,
            ).map((d) => d.id),
        ).toEqual(["any", "null"]);
        expect(isCoveragePointVisible(10, 10, index)).toBe(true);
    });

    it("keeps points inside an active area", () => {
        const index = buildCoverageIndex([
            area("jabar", true, feature(JAWA_BARAT)),
        ]);
        expect(isCoveragePointVisible(108.5, -7.7, index)).toBe(true);
    });

    it("hides points inside a disabled area", () => {
        const index = buildCoverageIndex([
            area("pangandaran", false, feature(PANGANDARAN)),
        ]);
        expect(isCoveragePointVisible(108.5, -7.7, index)).toBe(false);
        expect(isPointInInactiveCoverage(108.5, -7.7, index)).toBe(true);
    });

    it("lets a disabled child override an active parent", () => {
        const index = buildCoverageIndex([
            area("jabar", true, feature(JAWA_BARAT)),
            area("pangandaran", false, feature(PANGANDARAN)),
        ]);
        expect(isCoveragePointVisible(108.5, -7.7, index)).toBe(false);
        expect(isCoveragePointVisible(107.0, -6.5, index)).toBe(true);
    });

    it("lets an active child override a disabled parent", () => {
        const index = buildCoverageIndex([
            area("jabar", false, feature(JAWA_BARAT)),
            area("pangandaran", true, feature(PANGANDARAN)),
        ]);
        expect(isCoveragePointVisible(108.5, -7.7, index)).toBe(true);
        expect(isCoveragePointVisible(107.0, -6.5, index)).toBe(false);
    });

    it("hides points outside every polygon", () => {
        const index = buildCoverageIndex([
            area("pangandaran", true, feature(PANGANDARAN)),
        ]);
        expect(isCoveragePointVisible(106.8, -6.2, index)).toBe(false);
    });

    it("returns an empty map when every area is disabled", () => {
        const index = buildCoverageIndex([
            area("jabar", false, feature(JAWA_BARAT)),
        ]);
        expect(
            filterDestinationsByCoverage(
                [{ id: "dest", latitude: -6.9, longitude: 107.6 }],
                index,
            ),
        ).toEqual([]);
    });

    it("accepts numeric strings from the database", () => {
        const index = buildCoverageIndex([
            area("jabar", true, feature(JAWA_BARAT)),
        ]);
        expect(
            isCoordinateVisible(
                { latitude: "-6.9", longitude: "107.6" },
                index,
            ),
        ).toBe(true);
        expect(toCoordinate("107.6")).toBe(107.6);
        expect(toCoordinate("abc")).toBeNull();
    });

    it("ignores invalid geometry and therefore hides its points", () => {
        const index = buildCoverageIndex([area("broken", true, {})]);
        expect(index.activePolygons).toHaveLength(0);
        expect(isCoveragePointVisible(108.5, -7.7, index)).toBe(false);
    });

    it("parses MultiPolygon and FeatureCollection geometry", () => {
        const multi: GeoJSON.MultiPolygon = {
            type: "MultiPolygon",
            coordinates: [
                square(0, 0, 2, 2).coordinates,
                square(10, 10, 12, 12).coordinates,
            ],
        };
        const collection = {
            type: "FeatureCollection",
            features: [feature(JAWA_BARAT)],
        };

        expect(getAreaPolygons(area("multi", true, multi))).toHaveLength(2);
        expect(getAreaPolygons(area("collection", true, collection))).toHaveLength(
            1,
        );
    });
});
