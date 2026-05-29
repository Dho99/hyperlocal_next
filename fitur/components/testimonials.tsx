import { Star } from "lucide-react";
import type { ReviewCard } from "@/fitur/data/landing-data";

interface TestimonialsProps {
    items: ReviewCard[];
}

export function Testimonials({ items }: TestimonialsProps) {
    return (
        <section className="scroll-mt-20 bg-white/45 py-16" id="reviews">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        Testimoni Traveller
                    </h2>
                    <p className="mt-2 text-sm text-[#494551]">
                        Ulasan terbaru dengan rating tertinggi dari database.
                    </p>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {items.map((review) => (
                        <article
                            className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                            key={review.id}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-[#e1d4fd] font-bold text-[#4f378a]">
                                    {review.userName[0]}
                                </div>
                                <div>
                                    <p className="font-heading text-sm font-bold">
                                        {review.userName}
                                    </p>
                                    <div className="mt-1 flex text-[#c9a74d]">
                                        {Array.from({
                                            length: review.rating,
                                        }).map((_, index) => (
                                            <Star
                                                className="size-3.5 fill-current"
                                                key={index}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-5 line-clamp-4 text-sm italic leading-7 text-[#494551]">
                                &quot;{review.comment}&quot;
                            </p>
                            {review.destinationName && (
                                <p className="mt-4 text-xs font-semibold text-[#4f378a]">
                                    {review.destinationName}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
