"use client";

import { TileLayer } from "react-leaflet";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface ThemeTileLayerProps {
    lightUrl?: string;
    darkUrl?: string;
    attribution?: string;
}

const DEFAULT_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/">Esri</a>';

export function ThemeTileLayer({
    lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    darkUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution = DEFAULT_ATTRIBUTION,
}: ThemeTileLayerProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === "dark";
    const url = isDark ? darkUrl : lightUrl;

    return <TileLayer key={url} url={url} attribution={attribution} />;
}
