import { ShieldCheck, MapPin, Star } from "lucide-react";
import type { Destination } from "@/types/destination";

interface HeaderInfoProps {
    destination: Pick<
        Destination,
        | "name"
        | "status"
        | "city"
        | "province"
        | "rating"
        | "reviewCount"
        | "viewCount"
        | "category"
    >;
}

export function HeaderInfo({ destination }: HeaderInfoProps) {
    return (
        <div className="space-y-2 pb-4 border-b border-border/30">
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {destination.status === "APPROVED" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e1d4fd] text-[#645a7d] text-xs font-semibold tracking-wide">
                        <ShieldCheck className="size-3.5" />
                        Verifikasi Halal
                    </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-muted-foreground text-xs font-semibold tracking-wide">
                    <MapPin className="size-3.5" />
                    {[destination.city, destination.province]
                        .filter(Boolean)
                        .join(", ") || "Lokasi"}
                </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {destination.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {destination.rating != null && (
                    <div className="flex items-center gap-1">
                        <Star className="size-4 fill-[#e7c365] text-[#e7c365]" />
                        <span className="font-bold text-foreground">
                            {destination.rating.toFixed(1)}
                        </span>
                        {destination.reviewCount != null && (
                            <span>({destination.reviewCount} ulasan)</span>
                        )}
                    </div>
                )}
                {destination.reviewCount != null &&
                    destination.rating == null && (
                        <span>({destination.reviewCount} ulasan)</span>
                    )}
                {(destination.viewCount ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-border" />
                        {(destination.viewCount ?? 0).toLocaleString("id-ID")}{" "}
                        dilihat
                    </span>
                )}
                {destination.category && (
                    <>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span>{destination.category.name}</span>
                    </>
                )}
            </div>
        </div>
    );
}
