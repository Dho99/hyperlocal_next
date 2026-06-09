"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createDestinationReview } from "@/lib/api/review";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PublicReview } from "@/types/review";
import { StarRating } from "@/fitur/destinasi/components/star-rating";
import { formatRelativeDate } from "@/fitur/destinasi/data/destinasi-detail-data";

interface ReviewSectionProps {
    destinationId: string;
    initialReviews: PublicReview[];
    session: { user: { name: string; image?: string | null } } | null;
    sessionPending: boolean;
    onReviewSubmitted: (
        updatedReviews: PublicReview[],
    ) => void;
}

export function ReviewSection({
    destinationId,
    initialReviews,
    session,
    sessionPending,
    onReviewSubmitted,
}: ReviewSectionProps) {
    const router = useRouter();
    const [reviews, setReviews] = useState<PublicReview[]>(initialReviews);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const handleReviewLogin = useCallback(() => {
        const redirectTo = `${window.location.pathname}${window.location.search}`;
        router.push(`/halal?redirect=${encodeURIComponent(redirectTo)}`);
    }, [router]);

    const handleReviewSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!session) {
                handleReviewLogin();
                return;
            }
            try {
                setReviewSubmitting(true);
                setReviewError(null);
                await createDestinationReview({
                    destinationId,
                    rating: reviewRating,
                    comment: reviewComment,
                });
                const { getDestinationReviews } = await import(
                    "@/lib/api/review"
                );
                const updatedReviews = await getDestinationReviews(
                    destinationId,
                );
                setReviews(updatedReviews);
                onReviewSubmitted(updatedReviews);
                setReviewRating(5);
                setReviewComment("");
            } catch (err: unknown) {
                setReviewError(getApiErrorMessage(err));
            } finally {
                setReviewSubmitting(false);
            }
        },
        [
            destinationId,
            handleReviewLogin,
            reviewComment,
            reviewRating,
            session,
            onReviewSubmitted,
        ],
    );

    return (
        <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                    Ulasan Traveller
                </h2>
                {reviews.length > 5 && (
                    <button
                        type="button"
                        className="text-xs font-semibold tracking-wide text-primary hover:underline"
                    >
                        Lihat Semua
                    </button>
                )}
            </div>
            <div className="mb-5 rounded-xl border border-border/50 bg-card p-4 sm:p-5">
                {sessionPending ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Mengecek sesi...
                    </div>
                ) : !session ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">
                                Beri rating destinasi ini
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Masuk terlebih dahulu untuk mengirim rating dan
                                ulasan.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleReviewLogin}
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                            Masuk untuk Rating
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">
                                    Rating Anda
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Dibagikan sebagai {session.user.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                    const value = index + 1;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setReviewRating(value)
                                            }
                                            className="rounded-md p-1 text-[#e7c365] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                            aria-label={`${value} bintang`}
                                        >
                                            <Star
                                                className={cn(
                                                    "size-6",
                                                    value <= reviewRating
                                                        ? "fill-current"
                                                        : "fill-transparent text-border",
                                                )}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <textarea
                            value={reviewComment}
                            onChange={(event) =>
                                setReviewComment(event.target.value)
                            }
                            rows={3}
                            maxLength={1000}
                            placeholder="Bagikan pengalaman Anda..."
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                        />
                        {reviewError && (
                            <p className="text-sm font-medium text-destructive">
                                {reviewError}
                            </p>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={reviewSubmitting}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold tracking-wider text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {reviewSubmitting && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                Kirim Rating
                            </button>
                        </div>
                    </form>
                )}
            </div>
            {reviews.length > 0 ? (
                <div className="space-y-3">
                    {reviews.slice(0, 5).map((review) => (
                        <div
                            key={review.id}
                            className="bg-card p-4 sm:p-6 rounded-xl border border-border/50"
                        >
                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                                    {review.user.image ? (
                                        <Image
                                            src={review.user.image}
                                            alt={review.user.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        review.user.name
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                        <div className="font-bold text-sm text-foreground">
                                            {review.user.name}
                                        </div>
                                        <div className="flex text-[#e7c365]">
                                            <StarRating
                                                rating={review.rating}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {formatRelativeDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                &ldquo;{review.comment}&rdquo;
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
                    <User className="mx-auto h-8 w-8 text-border" />
                    <p className="mt-3 text-sm text-muted-foreground">
                        Belum ada ulasan untuk destinasi ini.
                    </p>
                </div>
            )}
        </div>
    );
}
