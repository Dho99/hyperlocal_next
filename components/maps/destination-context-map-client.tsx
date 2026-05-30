"use client";

import { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
} from "@/lib/maps/geo-utils";
import type { MapDestination, MapFacility } from "@/types/map-viewer";

fixLeafletIcons();

const DESTINATION_ICON = L.divIcon({
    className: "",
    html: `<div style="
        width: 40px; height: 40px;
        background: #F59E0B;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">★</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
});

const FACILITY_ICON = L.divIcon({
    className: "",
    html: `<div style="
        width: 28px; height: 28px;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">●</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
});

function FitBoundsControl({
    destination,
    facilities,
}: {
    destination: MapDestination;
    facilities: MapFacility[];
}) {
    const map = useMap();

    useEffect(() => {
        const points: [number, number][] = [
            [destination.latitude, destination.longitude],
            ...facilities.map((f) => [f.latitude, f.longitude] as [number, number]),
        ];

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, destination, facilities]);

    return null;
}

interface DestinationContextMapClientProps {
    destination: MapDestination;
    className?: string;
}

export default function DestinationContextMapClient({
    destination,
    className,
}: DestinationContextMapClientProps) {
    const mapCenter: [number, number] = useMemo(
        () => [destination.latitude, destination.longitude],
        [destination.latitude, destination.longitude],
    );

    return (
        <div
            className={
                className ||
                "h-[400px] w-full rounded-xl overflow-hidden border shadow-sm"
            }
        >
            <MapContainer
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBoundsControl
                    destination={destination}
                    facilities={destination.facilities}
                />

                <Marker
                    position={[destination.latitude, destination.longitude]}
                    icon={DESTINATION_ICON}
                >
                    <Popup>
                        <div className="p-1">
                            <p className="font-bold text-sm m-0">
                                {destination.name}
                            </p>
                            <p className="text-xs text-muted-foreground m-0 mt-1">
                                Destinasi Wisata
                            </p>
                            <p className="text-[10px] text-muted-foreground m-0 mt-1 font-mono">
                                {destination.latitude.toFixed(6)},{" "}
                                {destination.longitude.toFixed(6)}
                            </p>
                        </div>
                    </Popup>
                </Marker>

                {destination.facilities.map((facility) => (
                    <Marker
                        key={facility.id}
                        position={[facility.latitude, facility.longitude]}
                        icon={FACILITY_ICON}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-sm m-0">
                                    {facility.name}
                                </p>
                                <p className="text-xs text-muted-foreground m-0 mt-1 capitalize">
                                    {facility.type.replace(/_/g, " ").toLowerCase()}
                                </p>
                                <p className="text-[10px] text-muted-foreground m-0 mt-1 font-mono">
                                    {facility.latitude.toFixed(6)},{" "}
                                    {facility.longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
