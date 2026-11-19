export type RatingSource = "local" | "external" | null;

export function displayRatingMetrics(input: {
    rating?: number | null;
    reviewCount?: number | null;
    externalRating?: number | null;
    externalReviewCount?: number | null;
}) {
    const hasLocal = (input.reviewCount ?? 0) > 0 || (input.rating ?? 0) > 0;
    if (hasLocal) {
        return {
            rating: input.rating ?? null,
            reviewCount: input.reviewCount ?? 0,
            ratingSource: "local" as const,
        };
    }
    const hasExternal = (input.externalReviewCount ?? 0) > 0 || (input.externalRating ?? 0) > 0;
    return {
        rating: hasExternal ? input.externalRating ?? null : null,
        reviewCount: hasExternal ? input.externalReviewCount ?? 0 : 0,
        ratingSource: hasExternal ? "external" as const : null,
    };
}
