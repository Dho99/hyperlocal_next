"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, Marker, useMap } from "react-leaflet";
import { ThemeTileLayer } from "@/components/maps/theme-tile-layer";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/maps/geo-utils";
import { type BoundsLiteral } from "@/lib/maps/coverage-bounds";
import { useActiveCoverageAreas } from "@/hooks/use-active-coverage-areas";
import type { DashboardMapDestination } from "@/types/map-viewer";
import { getCategoryColor, createPinSvg } from "@/lib/config/map-categories";

fixLeafletIcons();

function createPinIcon(category?: string): L.DivIcon {
    const color = getCategoryColor(category);
    const svg = createPinSvg(color);
    const encodedSvg = encodeURIComponent(svg);
    return L.divIcon({
        className: "",
        html: `<img src="data:image/svg+xml;utf8,${encodedSvg}" alt="" style="pointer-events:none;display:block;" />`,
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [0, -42],
    });
}

const CLUSTER_CATEGORY_COLORS: Record<string, string> = {
    "Wisata Alam": "#16a34a",
    Pantai: "#2563eb",
    "Kuliner Halal": "#ea580c",
    Kuliner: "#ea580c",
    Penginapan: "#d97706",
    Hotel: "#d97706",
    Masjid: "#064e3b",
    "Tempat Ibadah": "#064e3b",
};

function getClusterColor(cluster: L.MarkerCluster): string {
    const markers = cluster.getAllChildMarkers();
    const categoryCounts: Record<string, number> = {};
    for (const m of markers) {
        const cat = (m as unknown as { category?: string }).category;
        if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    }
    let maxCount = 0;
    let dominantCat = "";
    for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantCat = cat;
        }
    }
    if (dominantCat && CLUSTER_CATEGORY_COLORS[dominantCat]) {
        return CLUSTER_CATEGORY_COLORS[dominantCat];
    }
    return "#064e3b";
}

const createClusterIcon = (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 36 : count < 100 ? 44 : 52;
    const color = getClusterColor(cluster);

    return L.divIcon({
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: ${size < 44 ? 12 : 14}px;
            font-family: system-ui, sans-serif;
            box-shadow: 0 2px 8px ${color}59;
        ">${count}</div>`,
        className: "",
        iconSize: L.point(size, size),
        iconAnchor: [size / 2, size / 2],
    });
};

function MapBoundsController({
    bounds,
    destinations,
}: {
    bounds: BoundsLiteral | null;
    destinations: DashboardMapDestination[];
}) {
    const map = useMap();
    const pointsKey = useMemo(
        () =>
            destinations
                .filter(
                    (d) =>
                        d.latitude != null &&
                        d.longitude != null &&
                        !isNaN(d.latitude) &&
                        !isNaN(d.longitude),
                )
                .map((d) => `${d.latitude},${d.longitude}`)
                .join("|"),
        [destinations],
    );

    useEffect(() => {
        if (bounds) {
            const target = L.latLngBounds(
                [bounds.south, bounds.west],
                [bounds.north, bounds.east],
            );
            if (target.isValid()) {
                map.fitBounds(target, { padding: [60, 60], maxZoom: 13 });
            }
            return;
        }

        if (!pointsKey) return;
        const points = pointsKey
            .split("|")
            .map((pair) => pair.split(",").map(Number) as [number, number]);
        const target = L.latLngBounds(points);
        if (target.isValid()) {
            map.fitBounds(target, { padding: [60, 60], maxZoom: 13 });
        }
    }, [map, bounds, pointsKey]);

    return null;
}

interface HeroMapClientProps {
    destinations: DashboardMapDestination[];
    onMarkerClick: (dest: DashboardMapDestination) => void;
}

export default function HeroMapClient({
    destinations,
    onMarkerClick,
}: HeroMapClientProps) {
    const { bounds } = useActiveCoverageAreas();

    const validDestinations = useMemo(
        () =>
            destinations.filter(
                (d) =>
                    d.latitude != null &&
                    d.longitude != null &&
                    !isNaN(d.latitude) &&
                    !isNaN(d.longitude),
            ),
        [destinations],
    );

    return (
        <div className="relative z-0 isolate h-full w-full">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <ThemeTileLayer />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                >
                    {validDestinations.map((dest) => (
                        <Marker
                            key={dest.id}
                            position={[dest.latitude, dest.longitude]}
                            icon={createPinIcon(dest.category)}
                            eventHandlers={{
                                click: () => onMarkerClick(dest),
                            }}
                        />
                    ))}
                </MarkerClusterGroup>

                <MapBoundsController
                    bounds={bounds}
                    destinations={validDestinations}
                />
            </MapContainer>
        </div>
    );
}
