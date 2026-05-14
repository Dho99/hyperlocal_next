import type { DestinationFormValues } from "@/lib/validations/destination.schema";

export type { DestinationFormValues };

export interface Category {
    id: string;
    name: string;
}

export interface HalalFacility {
    id: string;
    name: string;
}

export interface DestinationImage {
    imageUrl: string;
}

export interface Destination {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    description: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    latitude: string;
    longitude: string;
    updatedAt: Date | string;
    category?: Category | null;
    images?: DestinationImage[];
    facilities?: HalalFacility[];
}
