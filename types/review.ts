export interface PublicUser {
    id: string;
    name: string;
    image: string | null;
}

export interface ReviewSentiment {
    label: string;
}

export interface PublicReview {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    user: PublicUser;
    sentiment: ReviewSentiment | null;
}

/** Rating aggregates are local platform data; external metrics are separate. */
export interface ExternalRatingMetrics {
    externalRating?: number | null;
    externalReviewCount?: number | null;
    externalRatingSource?: string | null;
}
