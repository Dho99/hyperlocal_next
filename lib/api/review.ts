import type { PublicReview } from "@/types/review";
import { api } from "@/lib/axios";

interface ReviewResponse {
    success: boolean;
    data: PublicReview[];
}

export async function getDestinationReviews(
    destinationId: string,
): Promise<PublicReview[]> {
    const response = await api.get<ReviewResponse>("/reviews", {
        params: { destinationId, limit: 10 },
    });
    return response.data.data;
}
