"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, BadgeCheck, Store, ArrowLeft, Flag, MapPin, Clock } from "lucide-react";
import type { UmkmDetail } from "@/lib/services/umkm-service";
import { ScrollReveal } from "./scroll-reveal";
import { ReportDialog } from "@/components/report/report-dialog";
import { BookmarkButton } from "@/components/destinations/bookmark-button";
import {
    ImageLightbox,
    useImageLightbox,
} from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
    umkm: UmkmDetail;
}

function getTodayKey(): string {
    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    return days[new Date().getDay()];
}

function getUmkmOpeningStatus(openingHours: any): { isOpen: boolean; text: string } | null {
    if (!openingHours || typeof openingHours !== "object") return null;

    const today = getTodayKey();
    let hours: { open: string; close: string } | null = null;

    if ("open" in openingHours && "close" in openingHours) {
        hours = openingHours as { open: string; close: string };
    } else {
        const multi = openingHours as Record<string, { open: string; close: string }>;
        hours = multi[today] || null;
    }

    if (!hours) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    return {
        isOpen,
        text: isOpen ? `Buka • Tutup ${hours.close}` : `Tutup • Buka ${hours.open}`,
    };
}

export function HeroSection({ umkm }: HeroSectionProps) {
    const router = useRouter();
    const lightbox = useImageLightbox();
    const images = umkm.images ?? [];
    const coverImage = umkm.images?.[0]?.imageUrl;
    const hasCertification = umkm.certifications?.some(
        (c) => c.status === "VALID",
    );
    const avgRating =
        umkm.reviews.length > 0
            ? (
                  umkm.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  umkm.reviews.length
              ).toFixed(1)
            : umkm.rating?.toFixed(1) || "0.0";
    const reviewCount = umkm.reviews.length || umkm.reviewCount || 0;

    const locationLabel = umkm.destination 
        ? [umkm.destination.city, umkm.destination.province].filter(Boolean).join(", ") 
        : umkm.address;

    const openingStatus = getUmkmOpeningStatus(umkm.openingHours);

    return (
        <>
        <ScrollReveal>
            <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-[450px] rounded-xl shadow-md border border-stone-200/50 bg-stone-100 group">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={umkm.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-200">
                        <Store className="h-16 w-16 text-stone-400" />
                    </div>
                )}
                {coverImage && (
                    <button
                        type="button"
                        onClick={() => lightbox.openAt(0)}
                        aria-label={`Lihat galeri foto ${umkm.name}`}
                        className="absolute inset-0 z-[1] cursor-zoom-in focus:outline-none"
                    />
                )}

                {/* Back Button (Floating on Left) */}
                <button
                    type="button"
                    onClick={() => router.push("/umkm")}
                    aria-label="Kembali ke menu kuliner"
                    className="absolute left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-sm transition hover:bg-black/50 backdrop-blur-md"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Simpan & Laporkan Buttons (Floating on Right with Glassmorphism) */}
                <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                    <BookmarkButton
                        targetSlug={umkm.slug}
                        targetType="UMKM"
                        showLabel={true}
                        className="!w-auto px-4 py-2 !h-10 !rounded-full !bg-black/40 !border-white/10 !text-white hover:!bg-black/50 backdrop-blur-md transition-colors font-semibold text-xs flex items-center justify-center gap-1.5"
                    />
                    <ReportDialog
                        targetId={umkm.id}
                        targetType="UMKM"
                        trigger={
                            <button
                                type="button"
                                className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 text-white shadow-sm transition hover:bg-black/50 backdrop-blur-md text-xs font-semibold"
                            >
                                <Flag className="h-4 w-4" />
                                <span>Laporkan</span>
                            </button>
                        }
                    />
                </div>

                {/* Dark Gradient Overlay with Info Section (Image 2 style) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-32 pb-6 px-6 sm:px-8 z-10 flex flex-col justify-end pointer-events-none">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {hasCertification && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#0f9d58] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                                <BadgeCheck className="size-3.5 fill-white/10" />
                                TERVERIFIKASI HALAL
                            </span>
                        )}
                        {umkm.category?.name && (
                            <span className="inline-flex items-center px-3 py-1 rounded bg-white/10 text-white backdrop-blur-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                                {umkm.category.name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3 tracking-tight drop-shadow-md">
                        {umkm.name}
                    </h1>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-stone-200 font-semibold">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 drop-shadow">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-white">
                                {avgRating}
                            </span>
                            <span className="text-stone-300 font-normal">
                                ({reviewCount.toLocaleString("id-ID")} Ulasan)
                            </span>
                        </div>

                        {/* Location */}
                        {locationLabel && (
                            <div className="flex items-center gap-1.5 drop-shadow">
                                <MapPin className="size-4 text-stone-300" />
                                <span>{locationLabel}</span>
                            </div>
                        )}

                        {/* Opening Status */}
                        {openingStatus && (
                            <div className="flex items-center gap-1.5 drop-shadow">
                                <Clock className="size-4 text-stone-300" />
                                <span className={cn(
                                    "font-semibold",
                                    openingStatus.isOpen ? "text-emerald-400" : "text-rose-400"
                                )}>
                                    {openingStatus.isOpen ? "Buka" : "Tutup"}
                                </span>
                                <span className="text-stone-300 font-normal">• {openingStatus.text.split("•")[1]?.trim() || openingStatus.text}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ScrollReveal>

        <ImageLightbox
            images={images}
            open={lightbox.open}
            index={lightbox.index}
            onOpenChange={lightbox.setOpen}
            onIndexChange={lightbox.setIndex}
            alt={umkm.name}
        />
        </>
    );
}
