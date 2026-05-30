import { Building2, Utensils, Hotel } from "lucide-react";
import type { ComponentType } from "react";
import type { Destination } from "@/types/destination";

export interface FacilityInfo {
    id: string;
    name: string;
    instanceName: string | null;
    type: string | null;
    distance: number | null;
    maxDistance: number | null;
}

export interface NearbyUmkm {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
    rating: number | null;
    reviewCount: number | null;
    distance: number | null;
    primaryImage: string | null;
    validCertification: boolean;
    category: { id: string; name: string } | null;
}

export interface MapData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    facilities: Array<{
        id: string;
        name: string;
        type: string;
        latitude: number;
        longitude: number;
    }>;
}

export interface GalleryImage {
    imageUrl: string;
    caption?: string | null;
    isPrimary?: boolean;
}

export function formatRelativeDate(date: Date | string): string {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} Hari Lalu`;
}

export const FACILITY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    masjid: Building2,
    mosque: Building2,
    restaurant: Utensils,
    kuliner: Utensils,
    hotel: Hotel,
    penginapan: Hotel,
};

export const FACILITY_BG: Record<string, string> = {
    masjid: "bg-[#e9ddff] text-[#22005d]",
    mosque: "bg-[#e9ddff] text-[#22005d]",
    restaurant: "bg-[#e9ddff] text-[#1f1635]",
    kuliner: "bg-[#e9ddff] text-[#1f1635]",
    hotel: "bg-[#ffdf93] text-[#241a00]",
    penginapan: "bg-[#ffdf93] text-[#241a00]",
};

export function getFacilityIcon(type: string | null | undefined): ComponentType<{ className?: string }> {
    return FACILITY_ICONS[type?.toLowerCase() ?? ""] ?? Building2;
}

export function getFacilityIconBg(type: string | null | undefined): string {
    return FACILITY_BG[type?.toLowerCase() ?? ""] ?? "bg-[#e9ddff] text-[#22005d]";
}

export function isMosqueFacility(type: string | null | undefined, name: string): boolean {
    const value = `${type ?? ""} ${name}`.toLowerCase();
    return (
        value.includes("masjid") ||
        value.includes("mushola") ||
        value.includes("musholla") ||
        value.includes("mosque") ||
        value.includes("prayer")
    );
}

export function formatDistance(distance: number | null): string {
    if (distance == null) return "Di sekitar destinasi";
    return distance < 1
        ? `${Math.round(distance * 1000)} m`
        : `${distance.toFixed(1)} km`;
}

export function googleMapsUrl(destination: Destination): string {
    if (destination.latitude != null && destination.longitude != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [destination.name, destination.address, destination.city]
            .filter(Boolean)
            .join(", "),
    )}`;
}

export function getSavedDestinationIds(): string[] {
    try {
        const value = window.localStorage.getItem("savedDestinations");
        const parsed = JSON.parse(value ?? "[]");
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : [];
    } catch {
        return [];
    }
}
