import type { JsonValue } from "@/lib/generated/prisma/runtime/client";

export interface AccommodationImage {
    id: string;
    accommodationId: string;
    imageUrl: string;
    caption: string | null;
    isPrimary: boolean;
    createdAt: Date | string;
}

export interface AccommodationFacility {
    id: string;
    accommodationId: string;
    facilityId: string;
    name: string | null;
    facility: { id: string; name: string };
}

export interface Accommodation {
    id: string;
    name: string;
    slug: string;
    description: JsonValue;
    address: string | null;
    city: string | null;
    province: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
    estimatedCost: number | null;
    rating: number | null;
    reviewCount: number | null;
    validationStatus: string;
    surveyorNote: string | null;
    validatedScore: number | null;
    externalId: string | null;
    externalSource: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;

    images?: AccommodationImage[];
    reviews?: import("./review").PublicReview[];
    facilities?: AccommodationFacility[];
}

export interface AccommodationFormValues {
    name: string;
    slug: string;
    description?: JsonValue;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    website?: string | null;
    estimatedCost?: number | null;
    images?: { imageUrl: string; isPrimary?: boolean; caption?: string }[];
    facilityIds?: string[];
}
