export interface CandidateData {
    id: string;
    name: string;
    city: string | null;
    province: string | null;
    categoryName: string;
    description: string | null;
    address: string | null;
    halalScore: number | null;
    rating: number | null;
    facilityNames: string[];
    facilityTypes: string[];
}

export interface CandidateDestination {
    id: string;
    name: string;
    categoryName: string;
    description: string | null;
    halalScore: number | null;
    rating: number | null;
    facilityTypes: string[];
}

interface DestinationWithHalal {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    category?: { name: string } | null;
    description: unknown;
    address: string | null;
    halalScore: number | null;
    rating: number | null;
    images?: Array<{ imageUrl: string }>;
    destinationHalalFacilities?: Array<{
        facility: { name: string; facilityType: string | null };
    }>;
}

function serializeDescription(description: unknown): string | null {
    if (typeof description === "object" && description !== null) {
        return JSON.stringify(description);
    }
    return description as string | null;
}

export function mapToCandidateData(d: DestinationWithHalal): CandidateData {
    return {
        id: d.id,
        name: d.name,
        city: d.city,
        province: d.province,
        categoryName: d.category?.name ?? "",
        description: serializeDescription(d.description),
        address: d.address,
        halalScore: d.halalScore,
        rating: d.rating,
        facilityNames:
            d.destinationHalalFacilities
                ?.map((dhf) => dhf.facility.name)
                .filter(Boolean) ?? [],
        facilityTypes:
            d.destinationHalalFacilities
                ?.map((dhf) => dhf.facility.facilityType)
                .filter((t): t is string => t !== null) ?? [],
    };
}

export function mapToCandidateDestination(
    d: DestinationWithHalal,
): CandidateDestination {
    return {
        id: d.id,
        name: d.name,
        categoryName: d.category?.name ?? "",
        description: serializeDescription(d.description),
        halalScore: d.halalScore,
        rating: d.rating,
        facilityTypes:
            d.destinationHalalFacilities
                ?.map((dhf) => dhf.facility.facilityType)
                .filter((t): t is string => t !== null) ?? [],
    };
}
