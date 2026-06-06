"use client";

import { Polyline } from "react-leaflet";

interface FacilityRoutePolylineProps {
    from: [number, number];
    to: [number, number];
}

export default function FacilityRoutePolyline({
    from,
    to,
}: FacilityRoutePolylineProps) {
    return (
        <Polyline
            positions={[from, to]}
            pathOptions={{
                color: "#047857",
                dashArray: "8, 6",
                weight: 2,
                opacity: 0.7,
            }}
        />
    );
}
