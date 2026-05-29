"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { UserLocation } from "./peta-types";

interface UserLocationMarkerProps {
    location: UserLocation;
}

export default function UserLocationMarker({
    location,
}: UserLocationMarkerProps) {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng([location.lat, location.lng]);
            return;
        }

        const pulseIcon = L.divIcon({
            className: "",
            html: `<div style="position:relative;width:24px;height:24px">
                <div style="
                    position:absolute;inset:-12px;border-radius:50%;
                    background:rgba(59,130,246,0.2);
                    animation:pulse 2s infinite;
                "></div>
                <div style="
                    width:24px;height:24px;border-radius:50%;
                    background:#3B82F6;border:3px solid white;
                    box-shadow:0 0 0 0 rgba(59,130,246,0.5);
                    animation:pulse 2s infinite;
                "></div>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        const marker = L.marker([location.lat, location.lng], {
            icon: pulseIcon,
            zIndexOffset: 1000,
        }).addTo(map);

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                marker.remove();
                markerRef.current = null;
            }
        };
    }, [map, location]);

    return null;
}
