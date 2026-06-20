"use client";

import { TileLayer } from "react-leaflet";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface ThemeTileLayerProps {
    lightUrl?: string;
    darkUrl?: string;
    attribution?: string;
}

const CARTO_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export function ThemeTileLayer({
    lightUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution = CARTO_ATTRIBUTION,
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
