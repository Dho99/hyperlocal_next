"use client";

import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

export interface OsrmRouteInfo {
    distanceMeters: number;
    durationMinutes: number;
    profile: string;
    source: "OSRM";
}

interface FacilityRoutePolylineProps {
    from: [number, number];
    to: [number, number];
    travelMode?: string | null;
    onRouteInfo?: (info: OsrmRouteInfo | null) => void;
}

export default function FacilityRoutePolyline({
    from,
    to,
    travelMode,
    onRouteInfo,
}: FacilityRoutePolylineProps) {
    const map = useMap();
    const fromLat = from[0];
    const fromLng = from[1];
    const toLat = to[0];
    const toLng = to[1];
    const [positions, setPositions] = useState<Array<[number, number]>>([
        [fromLat, fromLng],
        [toLat, toLng],
    ]);
    const [isOsrmRoute, setIsOsrmRoute] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const profile =
            travelMode === "WALKING"
                ? "walking"
                : travelMode === "CYCLING"
                  ? "cycling"
                  : "driving";
        const params = new URLSearchParams({
            fromLat: String(fromLat),
            fromLng: String(fromLng),
            toLat: String(toLat),
            toLng: String(toLng),
            profile,
        });

        fetch(`/api/routes/osrm?${params}`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error("OSRM tidak tersedia");
                return response.json() as Promise<{
                    data?: {
                        positions?: Array<[number, number]>;
                        distanceMeters: number;
                        durationMinutes: number;
                        profile: string;
                        source: "OSRM";
                    };
                }>;
            })
            .then((result) => {
                const route = result.data;
                if (route?.positions?.length) {
                    setPositions(route.positions);
                    setIsOsrmRoute(true);
                    onRouteInfo?.({
                        distanceMeters: route.distanceMeters,
                        durationMinutes: route.durationMinutes,
                        profile: route.profile,
                        source: route.source,
                    });
                    map.fitBounds(L.latLngBounds(route.positions), {
                        padding: [70, 70],
                        maxZoom: 17,
                    });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setPositions([
                        [fromLat, fromLng],
                        [toLat, toLng],
                    ]);
                    setIsOsrmRoute(false);
                    onRouteInfo?.(null);
                }
            });

        return () => controller.abort();
    }, [
        fromLat,
        fromLng,
        map,
        onRouteInfo,
        toLat,
        toLng,
        travelMode,
    ]);

    return (
        <>
            {isOsrmRoute && (
                <Polyline
                    positions={positions}
                    pathOptions={{ color: "white", weight: 9, opacity: 0.9 }}
                />
            )}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: "#047857",
                    dashArray: isOsrmRoute ? undefined : "8, 6",
                    weight: isOsrmRoute ? 5 : 2,
                    opacity: isOsrmRoute ? 1 : 0.7,
                }}
            />
        </>
    );
}
