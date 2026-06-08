import type { JsonValue } from "@/lib/generated/prisma/runtime/client";
import type { DestinationFormValues } from "@/lib/validations/destination.schema";

export type { DestinationFormValues };

export interface Category {
    id: string;
    name: string;
}

export interface HalalFacility {
    id: string;
    name: string;
    facilityType: string | null;
    maxDistance: number;
}

export interface DestinationImage {
    id?: string;
    imageUrl: string;
    caption?: string | null;
    isPrimary?: boolean;
    createdAt?: Date | string;
}

export interface DestinationFacilityEvidence {
    imageUrl: string;
}

export interface DestinationHalalFacility {
    id: string;
    destinationId: string;
    facilityId: string;
    latitude: number | null;
    longitude: number | null;
    name?: string | null;
    facility?: HalalFacility;
    evidences?: DestinationFacilityEvidence[];
}

export interface Destination {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    coverageAreaId: string | null;
    description: JsonValue | null;
    address: string | null;
    city: string | null;
    province: string | null;
    latitude: number | null;
    longitude: number | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rating: number | null;
    reviewCount: number | null;
    openingHours: JsonValue | null;
    halalScore: number | null;
    validatedScore: number | null;
    viewCount?: number;
    categoryScores: JsonValue | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: Category | null;
    images?: DestinationImage[];
    destinationHalalFacilities?: DestinationHalalFacility[];
    umkms?: Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        address: string | null;
        phone: string | null;
        latitude: number | null;
        longitude: number | null;
        rating?: number | null;
        reviewCount?: number | null;
        category?: Category | null;
        images?: Array<{
            id?: string;
            imageUrl: string;
            isPrimary?: boolean;
        }>;
        certifications?: Array<{
            id: string;
            status: string;
            certificateNo: string | null;
            issuer: string | null;
        }>;
    }>;
}

export interface HalalValidationView {
    id: string;
    destinationId: string | null;
    certificationId: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminScore: number | null;
    categoryScores: JsonValue | null;
    notes: string | null;
    validatedAt: Date | string | null;
    createdAt: Date | string;
    validator: { id: string; name: string } | null;
    destination?: Destination | null;
    certification?: {
        id: string;
        certificateNo: string | null;
        umkm: { id: string; name: string };
    } | null;
}

export interface CategoryScoreInput {
    facilityType: string;
    label: string;
    score: number;
    weight: number;
    facilities: Array<{
        id: string;
        name: string;
        weight: number;
        facilityType: string;
        evidences: Array<{ imageUrl: string }>;
    }>;
}
