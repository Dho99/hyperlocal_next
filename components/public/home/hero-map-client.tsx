"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
} from "@/lib/maps/geo-utils";
import type { DashboardMapDestination } from "@/types/map-viewer";

fixLeafletIcons();

const createClusterIcon = (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 36 : count < 100 ? 44 : 52;

    return L.divIcon({
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background: #3B82F6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: ${size < 44 ? 12 : 14}px;
            font-family: system-ui, sans-serif;
            box-shadow: 0 2px 8px rgba(59,130,246,0.35);
        ">${count}</div>`,
        className: "",
        iconSize: L.point(size, size),
        iconAnchor: [size / 2, size / 2],
    });
};

const MARKER_ICON = L.divIcon({
    className: "",
    html: `<div style="
        width: 32px; height: 32px;
        background: #4f378a;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        box-shadow: 0 2px 8px rgba(79,55,138,0.3);
    ">★</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

interface HeroMapClientProps {
    destinations: DashboardMapDestination[];
    onMarkerClick: (dest: DashboardMapDestination) => void;
}

export default function HeroMapClient({
    destinations,
    onMarkerClick,
}: HeroMapClientProps) {
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
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                >
                    {validDestinations.map((dest) => (
                        <Marker
                            key={dest.id}
                            position={[dest.latitude, dest.longitude]}
                            icon={MARKER_ICON}
                            eventHandlers={{
                                click: () => onMarkerClick(dest),
                            }}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
