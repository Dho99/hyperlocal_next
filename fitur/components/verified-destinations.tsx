"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { DestinationCard } from "@/fitur/data/utils";
import { SectionHeading } from "@/components/public/home/section-heading";
import { HalalBadge } from "@/components/ui/halal-badge";

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
                            className="relative block rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-300 hover:bg-card/90"
                            href={`/destinasi/${destination.slug}`}
                        >
                            <HalalBadge score={destination.halalScore} />
                            <div className="relative aspect-[16/9] bg-muted rounded-t-2xl overflow-hidden">
                                {destination.imageUrl ? (
                                    <Image
                                        alt={destination.name}
                                        className="object-cover"
                                        fill
                                        sizes="(min-width: 1024px) 33vw, 100vw"
                                        src={destination.imageUrl}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-accent rounded-t-2xl overflow-hidden">
                                        <ShieldCheck className="size-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="line-clamp-2 font-heading text-xl font-bold text-foreground">
                                    {destination.name}
                                </h3>
                                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
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
