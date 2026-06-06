"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import type { DestinationCard } from "@/fitur/data/utils";
import { SectionHeading } from "@/components/public/home/section-heading";

interface VerifiedDestinationsProps {
    items: DestinationCard[];
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const MotionLink = motion.create(Link);

export function VerifiedDestinations({ items }: VerifiedDestinationsProps) {
    if (items.length === 0) return null;

    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="verified"
        >
            <SectionHeading
                action="Buka Listing"
                actionHref="/destinasi"
                eyebrow="Pilihan dengan skor kesiapan halal tertinggi."
                title="Destinasi Terverifikasi"
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 grid gap-6 lg:grid-cols-3"
            >
                {items.map((destination) => (
                    <motion.div key={destination.id} variants={itemVariants}>
                        <MotionLink
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="block overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-lg shadow-stone-900/5"
                            href={`/destinasi/${destination.slug}`}
                        >
                            <div className="relative aspect-[16/9] bg-stone-100">
                                {destination.imageUrl ? (
                                    <Image
                                        alt={destination.name}
                                        className="object-cover"
                                        fill
                                        sizes="(min-width: 1024px) 33vw, 100vw"
                                        src={destination.imageUrl}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-emerald-900">
                                        <ShieldCheck className="size-12" />
                                    </div>
                                )}
                                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-sm backdrop-blur-md">
                                    <CheckCircle2 className="size-4" />
                                    Verified Halal
                                </div>
                                <div className="absolute bottom-4 right-4 rounded-full bg-emerald-900 px-3 py-2 text-sm font-bold text-white shadow-lg">
                                    {destination.score ?? 0}%
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="line-clamp-2 font-heading text-xl font-bold text-stone-900">
                                    {destination.name}
                                </h3>
                                <p className="mt-2 flex items-center gap-2 text-sm text-stone-600">
                                    <MapPin className="size-4 shrink-0" />
                                    {destination.location}
                                </p>
                            </div>
                        </MotionLink>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
