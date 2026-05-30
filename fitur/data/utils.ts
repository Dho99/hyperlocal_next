import type { ComponentType } from "react";
import type {
    Reason,
    Step,
    Faq,
} from "./landing";

export type { Reason, Step, Faq };

export interface DestinationCard {
    id: string;
    name: string;
    location: string;
    category: string;
    rating: number;
    reviewCount: number;
    score: number | null;
    status: string;
    imageUrl: string | null;
}

export interface FacilityHighlight {
    title: string;
    count: string;
    icon: ComponentType<{ className?: string }>;
}

export interface UmkmCard {
    id: string;
    name: string;
    rating: number | null;
    reviewCount: number | null;
    categoryName: string | null;
    location: string;
    hasCertification: boolean;
}

export interface ReviewCard {
    id: string;
    userName: string;
    rating: number;
    comment: string | null;
    destinationName: string | null;
}

export interface RouteIdea {
    location: string;
    name: string;
    imageUrl: string | null;
}

export function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

export function percent(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

export function locationLabel(city?: string | null, province?: string | null) {
    return [city, province].filter(Boolean).join(", ") || "Wilayah belum diisi";
}

function safeImage(src?: string | null) {
    if (!src) return null;
    if (src.startsWith("/")) return src;
    if (src.startsWith("https://images.unsplash.com/")) return src;
    if (src.startsWith("https://plus.unsplash.com/")) return src;
    return null;
}

export function scoreLabel(score: number | null) {
    if (score == null) return "Belum Dinilai";
    if (score >= 80) return "A-Grade";
    if (score >= 60) return "B-Grade";
    return "C-Grade";
}

export function toDestinationCard(destination: {
    id: string;
    name: string;
    city: string | null;
    province: string | null;
    status: string;
    rating: number | null;
    reviewCount: number | null;
    category: { name: string } | null;
    images: Array<{ imageUrl: string }>;
}): DestinationCard {
    return {
        id: destination.id,
        name: destination.name,
        location: locationLabel(destination.city, destination.province),
        category: destination.category?.name || "Destinasi",
        rating: destination.rating || 0,
        reviewCount: destination.reviewCount || 0,
        score:
            destination.status === "APPROVED"
                ? Math.round((destination.rating || 0) * 20)
                : null,
        status: destination.status,
        imageUrl: safeImage(destination.images[0]?.imageUrl),
    };
}
