"use client";

import { useMemo, useCallback } from "react";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { ThemeTileLayer } from "@/components/maps/theme-tile-layer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
} from "@/lib/maps/geo-utils";
import type { DashboardMapDestination } from "@/types/map-viewer";
import { useRouter } from "next/navigation";

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

interface DashboardMapProps {
    destinations: DashboardMapDestination[];
}

export default function DashboardMap({ destinations }: DashboardMapProps) {
    const router = useRouter();

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

    const handleDetail = useCallback(
        (id: string) => {
            router.push(`/destinations/${id}`);
        },
        [router],
    );

    return (
        <div className="h-full w-full">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <ThemeTileLayer
                    lightUrl="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterIcon}
                >
                    {validDestinations.map((dest) => (
                        <Marker
                            key={dest.id}
                            position={[dest.latitude, dest.longitude]}
                        >
                            <Popup>
                                <div className="min-w-[160px]">
                                    <p className="font-bold text-sm m-0">
                                        {dest.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {dest.category && (
                                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                {dest.category}
                                            </span>
                                        )}
                                        {dest.status && (
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                    dest.status === "APPROVED"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : dest.status ===
                                                            "REJECTED"
                                                          ? "bg-red-100 text-red-800"
                                                          : "bg-amber-100 text-amber-800"
                                                }`}
                                            >
                                                {dest.status === "APPROVED"
                                                    ? "Terverifikasi"
                                                    : dest.status === "REJECTED"
                                                      ? "Ditolak"
                                                      : "Pending"}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDetail(dest.id)}
                                        className="mt-2 w-full text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded transition-colors"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
