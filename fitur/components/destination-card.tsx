"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin, Star } from "lucide-react";
import type { DestinationCard } from "@/fitur/data/utils";
import { HalalBadge } from "@/components/ui/halal-badge";

interface DestinationCardProps {
    destination: DestinationCard;
}

const MotionLink = motion.create(Link);

export function DestinationCardComponent({
    destination,
}: DestinationCardProps) {
    return (
        <MotionLink
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative block rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-lg shadow-black/10 transition-all duration-300 hover:bg-card/90"
            href={`/destinasi/${destination.slug}`}
        >
            <HalalBadge score={destination.halalScore} />
            <div className="relative aspect-[16/10] rounded-t-2xl overflow-hidden bg-muted">
                {destination.imageUrl ? (
                    <Image
                        alt={destination.name}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        src={destination.imageUrl}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-accent rounded-t-2xl overflow-hidden">
                        <MapPin className="size-10" />
                    </div>
                )}
                <span
                    aria-label={`Simpan ${destination.name}`}
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/75 text-accent backdrop-blur-md"
                >
                    <Bookmark className="size-4" />
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-heading text-base font-bold leading-tight text-foreground">
                        {destination.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        <Star className="size-3 fill-current" />
                        {destination.rating.toFixed(1)}
                    </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="line-clamp-1">{destination.location}</span>
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] font-bold uppercase tracking-wide">
                    <span className="rounded bg-accent/20 px-2 py-1 text-accent">
                        {destination.category}
                    </span>
                </div>
            </div>
        </MotionLink>
    );
}
