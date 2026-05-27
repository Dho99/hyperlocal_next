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
