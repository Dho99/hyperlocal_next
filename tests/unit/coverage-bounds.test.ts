import { describe, expect, it } from "vitest";
import {
    getActiveCoverageBounds,
    getGeoJsonBounds,
    toCoverageFeatureCollection,
    unionBounds,
    type CoverageAreaSummary,
} from "@/lib/maps/coverage-bounds";

const polygon = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [108.1, -7.5],
                [108.5, -7.5],
                [108.5, -7.1],
                [108.1, -7.1],
                [108.1, -7.5],
            ],
        ],
    },
};

function area(
    id: string,
    geoJsonData: unknown,
    colorHex: string | null = "#047857",
): CoverageAreaSummary {
    return { id, name: `Area ${id}`, level: "REGIONAL", geoJsonData, colorHex };
}

describe("getGeoJsonBounds", () => {
    it("returns null for the empty object used by old seed data", () => {
        expect(getGeoJsonBounds({})).toBeNull();
        expect(getGeoJsonBounds(null)).toBeNull();
        expect(getGeoJsonBounds({ type: "Polygon", coordinates: [] })).toBeNull();
    });

    it("maps GeoJSON [lng, lat] into south/west/north/east", () => {
        expect(getGeoJsonBounds(polygon)).toEqual({
            south: -7.5,
            west: 108.1,
            north: -7.1,
            east: 108.5,
        });
    });

    it("ignores out-of-range coordinates", () => {
        expect(
            getGeoJsonBounds({
                type: "Point",
                coordinates: [200, 95],
            }),
        ).toBeNull();
    });
});

describe("unionBounds", () => {
    it("merges disjoint envelopes", () => {
        expect(
            unionBounds([
                { south: -8, west: 107, north: -7, east: 108 },
                { south: -7.5, west: 108.5, north: -6.5, east: 109 },
            ]),
        ).toEqual({ south: -8, west: 107, north: -6.5, east: 109 });
    });

    it("returns null when nothing is valid", () => {
        expect(unionBounds([null, undefined])).toBeNull();
    });
});

describe("getActiveCoverageBounds", () => {
    it("skips areas without geometry and unions the rest", () => {
        const bounds = getActiveCoverageBounds([
            area("broken", {}),
            area("valid", polygon),
        ]);
        expect(bounds).toEqual({
            south: -7.5,
            west: 108.1,
            north: -7.1,
            east: 108.5,
        });
    });

    it("returns null when every area has empty geometry", () => {
        expect(getActiveCoverageBounds([area("a", {})])).toBeNull();
    });
});

describe("toCoverageFeatureCollection", () => {
    it("normalizes geometries and attaches area metadata", () => {
        const collection = toCoverageFeatureCollection([
            area("valid", polygon, "#1d4ed8"),
            area("broken", {}),
        ]);

        expect(collection?.features).toHaveLength(1);
        expect(collection?.features[0].properties).toMatchObject({
            id: "valid",
            name: "Area valid",
            colorHex: "#1d4ed8",
        });
    });

    it("accepts a bare geometry object", () => {
        const collection = toCoverageFeatureCollection([
            area("geom", polygon.geometry),
        ]);
        expect(collection?.features).toHaveLength(1);
    });

    it("returns null when there is no renderable geometry", () => {
        expect(toCoverageFeatureCollection([area("broken", {})])).toBeNull();
    });
});
