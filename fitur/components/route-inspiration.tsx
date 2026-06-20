"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";
import type { RouteIdea } from "@/fitur/data/utils";
import { SectionHeading } from "@/components/public/home/section-heading";

interface RouteInspirationProps {
    items: RouteIdea[];
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

const MotionLink = motion.create(Link);

export function RouteInspiration({ items }: RouteInspirationProps) {
    if (items.length === 0) return null;

    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="routes"
        >
            <SectionHeading
                action="Jelajahi Semua"
                actionHref="/destinasi"
                eyebrow="Ide perjalanan dibuat dari wilayah destinasi populer."
                title="Inspirasi Rute"
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 grid gap-6 md:grid-cols-3"
            >
                {items.map((route) => (
                    <motion.div key={route.location} variants={itemVariants}>
                        <MotionLink
                            whileHover={{ scale: 1.02 }}
                            className="group relative block aspect-[16/9] overflow-hidden rounded-2xl border border-border/30 bg-card shadow-lg shadow-black/10"
                            href={`/destinasi?search=${encodeURIComponent(route.location)}`}
                        >
                            {route.imageUrl ? (
                                <Image
                                    alt={route.name}
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    src={route.imageUrl}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-emerald-100" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                <h3 className="font-heading text-lg font-bold">
                                    Jelajah {route.location}
                                </h3>
                                <p className="mt-2 flex items-center gap-1 text-xs">
                                    <Compass className="size-3.5" />
                                    Berawal dari {route.name}
                                </p>
                            </div>
                        </MotionLink>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
