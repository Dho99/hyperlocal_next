"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { ReviewCard } from "@/fitur/data/utils";

interface TestimonialsProps {
    items: ReviewCard[];
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Testimonials({ items }: TestimonialsProps) {
    if (items.length === 0) return null;

    return (
        <section className="bg-emerald-900 py-20" id="reviews">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="font-heading text-3xl font-bold tracking-tighter text-white sm:text-4xl lg:text-5xl">
                        Testimoni Traveller
                    </h2>
                    <p className="mt-3 text-base text-emerald-100">
                        Ulasan terbaru dengan rating tertinggi dari database.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mt-10 grid gap-6 md:grid-cols-3"
                >
                    {items.map((review) => (
                        <motion.article
                            key={review.id}
                            variants={itemVariants}
                            className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-full bg-emerald-700/40 font-bold text-white">
                                    {review.userName[0]}
                                </div>
                                <div>
                                    <p className="font-heading text-sm font-bold text-white">
                                        {review.userName}
                                    </p>
                                    <div className="mt-1 flex text-amber-400">
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
                            <p className="mt-5 line-clamp-4 text-sm italic leading-7 text-emerald-50">
                                &quot;{review.comment}&quot;
                            </p>
                            {review.destinationName && (
                                <p className="mt-4 text-xs font-semibold text-emerald-300">
                                    {review.destinationName}
                                </p>
                            )}
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
