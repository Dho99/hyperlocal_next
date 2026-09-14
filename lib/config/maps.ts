export const MAP_PROVIDER = "esri" as const;

export const ESRI_LIGHT_URL =
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
export const ESRI_DARK_URL =
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
export const ESRI_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/">Esri</a>';

export const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_MAX_ZOOM = 19;
export const MAP_DEFAULT_CENTER: [number, number] = [-7.3274, 108.2207];
export const MAP_DEFAULT_ZOOM = 13;

export function normalizeCartoUrl(rawUrl: string): string {
    const key = (process.env.NEXT_PUBLIC_CARTO_API_KEY || process.env.CARTO_API_KEY || "").trim();
    if (!key) return rawUrl.trim();
    const url = rawUrl.trim();
    if (url.includes("api_key=")) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}api_key=${encodeURIComponent(key)}`;
}
