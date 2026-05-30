"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "@/lib/maps/leaflet-fix";
import {
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
    isValidCoordinate,
} from "@/lib/maps/geo-utils";

fixLeafletIcons();

interface MapMarker {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    subtitle?: string;
}

interface ReadonlyMapClientProps {
    markers: MapMarker[];
    center?: [number, number];
    zoom?: number;
    className?: string;
}

export default function ReadonlyMapClient({
    markers = [],
    center,
    zoom = DEFAULT_ZOOM,
    className,
}: ReadonlyMapClientProps) {
    const mapCenter: [number, number] = useMemo(() => {
        if (center) return center;
        if (
            markers?.length > 0 &&
            isValidCoordinate(markers[0].latitude, markers[0].longitude)
        ) {
            return [markers[0].latitude, markers[0].longitude];
        }
        return DEFAULT_CENTER;
    }, [center, markers]);

    return (
        <div
            className={
                className ||
                "h-[400px] w-full rounded-xl overflow-hidden border shadow-sm"
            }
        >
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.latitude, marker.longitude]}
                    >
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-sm m-0">
                                    {marker.title}
                                </p>
                                {marker.subtitle && (
                                    <p className="text-xs text-muted-foreground m-0 mt-1">
                                        {marker.subtitle}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground m-0 mt-1 font-mono">
                                    {marker.latitude.toFixed(6)},{" "}
                                    {marker.longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
