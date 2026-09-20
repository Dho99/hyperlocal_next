"use client";

import { TileLayer } from "react-leaflet";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { OSM_URL, ESRI_DARK_URL, ESRI_ATTRIBUTION, OSM_ATTRIBUTION } from "@/lib/config/maps";

interface ThemeTileLayerProps {
    lightUrl?: string;
    darkUrl?: string;
    attribution?: string;
    fallbackUrl?: string;
    fallbackAttribution?: string;
}

export { normalizeCartoUrl } from "@/lib/config/maps";

export function ThemeTileLayer({
    lightUrl = OSM_URL,
    darkUrl = ESRI_DARK_URL,
    attribution = ESRI_ATTRIBUTION,
    fallbackUrl = OSM_URL,
    fallbackAttribution = OSM_ATTRIBUTION,
}: ThemeTileLayerProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [failed, setFailed] = useState(false);
    const errorCount = useRef(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === "dark";
    const primaryUrl = (isDark ? darkUrl : lightUrl).trim();
    const key = `${primaryUrl}|${failed ? "fallback" : "primary"}`;

    useEffect(() => {
        errorCount.current = 0;
        setFailed(false);
    }, [primaryUrl]);

    if (failed) {
        return <TileLayer key={key} url={fallbackUrl} attribution={fallbackAttribution} />;
    }

    return (
        <TileLayer
            key={key}
            url={primaryUrl}
            attribution={attribution}
            eventHandlers={{
                tileerror: () => {
                    errorCount.current += 1;
                    if (errorCount.current >= 3) setFailed(true);
                },
            }}
        />
    );
}
