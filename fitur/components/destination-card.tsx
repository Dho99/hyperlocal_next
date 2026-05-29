import Image from "next/image";
import Link from "next/link";
import { Bookmark, CheckCircle2, MapPin, Star } from "lucide-react";
import type { DestinationCard } from "@/fitur/data/landing-data";
import { scoreLabel } from "@/fitur/data/landing-data";

interface DestinationCardProps {
    destination: DestinationCard;
}

export function DestinationCardComponent({ destination }: DestinationCardProps) {
    return (
        <Link
            className="group overflow-hidden rounded-xl border border-[#cbc4d2]/50 bg-white shadow-lg shadow-[#0f172a]/5 transition hover:-translate-y-1 hover:shadow-xl"
            href={`/destinasi/${destination.id}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f2ecf4]">
                {destination.imageUrl ? (
                    <Image
                        alt={destination.name}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        src={destination.imageUrl}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[#4f378a]">
                        <MapPin className="size-10" />
                    </div>
                )}
                {destination.status === "APPROVED" && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                        <CheckCircle2 className="size-3.5" />
                        Verified
                    </div>
                )}
                <span
                    aria-label={`Simpan ${destination.name}`}
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/75 text-[#4f378a] backdrop-blur-md"
                >
                    <Bookmark className="size-4" />
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-heading text-base font-bold leading-tight">
                        {destination.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ffdf93]/55 px-2 py-1 text-xs font-semibold text-[#594400]">
                        <Star className="size-3 fill-current" />
                        {destination.rating.toFixed(1)}
                    </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-[#494551]">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="line-clamp-1">{destination.location}</span>
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#e6e0e9] pt-3 text-[11px] font-bold uppercase tracking-wide">
                    <span className="rounded bg-[#e9ddff] px-2 py-1 text-[#4f378a]">
                        {destination.category}
                    </span>
                    <span className="text-[#4f378a]">
                        {scoreLabel(destination.score)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
