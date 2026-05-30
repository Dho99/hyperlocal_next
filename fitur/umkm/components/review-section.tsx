"use client";

import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import type { PublicReview } from "@/types/review";
import { ScrollReveal } from "./scroll-reveal";

interface ReviewSectionProps {
    umkmId: string;
    initialReviews: PublicReview[];
}

function formatRelativeDate(date: Date | string): string {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function ReviewSection({ umkmId, initialReviews }: ReviewSectionProps) {
    return (
        <ScrollReveal>
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-emerald-900">
                        Ulasan
                    </h2>
                    <Link
                        href={`/umkm/rating/${umkmId}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-900"
                    >
                        <MessageSquare size={16} />
                        Tulis Ulasan
                    </Link>
                </div>

                {initialReviews.length === 0 ? (
                    <div className="rounded-lg border border-stone-200 p-8 text-center">
                        <p className="text-stone-500">
                            Belum ada ulasan. Jadilah yang pertama!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {initialReviews.map((review) => (
                            <div
                                key={review.id}
                                className="rounded-lg border border-stone-200 p-4"
                            >
                                <div className="mb-3 flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                                        {review.user.image ? (
                                            <img
                                                src={review.user.image}
                                                alt={review.user.name}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            getInitials(review.user.name)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-stone-900 text-sm">
                                                {review.user.name}
                                            </p>
                                            <span className="text-xs text-stone-400">
                                                {formatRelativeDate(
                                                    review.createdAt,
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    size={14}
                                                    className={
                                                        s <= review.rating
                                                            ? "fill-current text-amber-500"
                                                            : "text-stone-200"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-stone-700 leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </ScrollReveal>
    );
}
