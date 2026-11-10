import type { Prisma } from "@/lib/generated/prisma";

export type DestinationSort = "newest" | "rating" | "score" | "reviews" | "name";

/**
 * Destinations with at least one photo always rank above photo-less ones.
 * The remaining keys preserve the requested sort order inside each group.
 */
const IMAGE_PRIORITY = {
    images: { _count: "desc" },
} satisfies Prisma.DestinationOrderByWithRelationInput;

export function getDestinationOrderBy(
    sort: DestinationSort = "newest",
): Prisma.DestinationOrderByWithRelationInput[] {
    const orderByMap = {
        newest: [IMAGE_PRIORITY, { createdAt: "desc" }, { id: "desc" }],
        rating: [
            IMAGE_PRIORITY,
            { rating: "desc" },
            { reviewCount: "desc" },
            { id: "desc" },
        ],
        score: [
            IMAGE_PRIORITY,
            { validatedScore: { sort: "desc", nulls: "last" } },
            { halalScore: { sort: "desc", nulls: "last" } },
            { id: "desc" },
        ],
        reviews: [
            IMAGE_PRIORITY,
            { reviewCount: "desc" },
            { rating: "desc" },
            { id: "desc" },
        ],
        name: [IMAGE_PRIORITY, { name: "asc" }, { id: "asc" }],
    } satisfies Record<
        DestinationSort,
        Prisma.DestinationOrderByWithRelationInput[]
    >;

    return orderByMap[sort];
}
