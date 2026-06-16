import Image from "next/image";
import { ArrowLeft, ImageIcon, ShieldCheck, MapPin, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/destinations/bookmark-button";
import type { GalleryImage } from "@/fitur/destinasi/data/destinasi-detail-data";
import type { Destination } from "@/types/destination";

interface HeroGalleryProps {
    primaryImage: string | null;
    secondaryImages: GalleryImage[];
    destination: Destination;
    heroLoaded: boolean;
    onHeroLoad: () => void;
    onBack: () => void;
    destinationId: string;
    onImageClick?: (index: number) => void;
}

function getTodayIndoKey(): string {
    const days = [
        "minggu",
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
    ];
    return days[new Date().getDay()];
}

function getDestinationOpeningStatus(openingHours: any): { isOpen: boolean; text: string } | null {
    if (!openingHours || typeof openingHours !== "object") return null;

    const today = getTodayIndoKey();
    const todayHours = (openingHours as Record<string, string>)[today];
    if (!todayHours) return null;

    const parts = todayHours.split("-");
    if (parts.length !== 2) return null;

    const [openStr, closeStr] = parts;
    const [openH, openM] = openStr.split(":").map(Number);
    const [closeH, closeM] = closeStr.split(":").map(Number);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    return {
        isOpen,
        text: isOpen ? `Buka • Tutup ${closeStr}` : `Tutup • Buka ${openStr}`,
    };
}

export function HeroGallery({
    primaryImage,
    secondaryImages,
    destination,
    heroLoaded,
    onHeroLoad,
    onBack,
    destinationId,
    onImageClick,
}: HeroGalleryProps) {
    const locationLabel = [destination.city, destination.province].filter(Boolean).join(", ");
    const openingStatus = getDestinationOpeningStatus(destination.openingHours);
    const allImages = destination.images ?? [];
    const globalIndexOf = (url: string) => {
        const i = allImages.findIndex((img) => img.imageUrl === url);
        return i >= 0 ? i : 0;
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,220px)] gap-2 md:gap-3 h-auto md:h-[614px] rounded-xl overflow-hidden shadow-md">
            <div className="bg-accent relative group min-h-[380px] md:min-h-0">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Kembali ke Destinasi"
                    className="absolute top-4 left-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white/90 text-foreground shadow-sm transition hover:bg-emerald-50 backdrop-blur-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={destination.name}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-700 group-hover:scale-105",
                            heroLoaded ? "opacity-100" : "opacity-0",
                        )}
                        onLoad={onHeroLoad}
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-border" />
                    </div>
                )}
                {onImageClick && primaryImage && (
                    <button
                        type="button"
                        onClick={() => onImageClick(globalIndexOf(primaryImage))}
                        aria-label={`Lihat galeri foto ${destination.name}`}
                        className="absolute inset-0 z-[1] cursor-zoom-in focus:outline-none"
                    />
                )}
                <div className="absolute top-4 right-4 z-20">
                    <BookmarkButton
                        targetSlug={destinationId}
                        targetType="DESTINASI"
                        showLabel={false}
                    />
                </div>

                {/* Dark Gradient Overlay with Info Section (Image 2 style) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-32 pb-6 px-6 sm:px-8 z-10 flex flex-col justify-end pointer-events-none">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {destination.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#0f9d58] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                                <ShieldCheck className="size-3.5 fill-white/10" />
                                TERVERIFIKASI HALAL
                            </span>
                        )}
                        {destination.category && (
                            <span className="inline-flex items-center px-3 py-1 rounded bg-black/40 text-white backdrop-blur-sm text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10 shadow-sm">
                                {destination.category.name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3 tracking-tight drop-shadow-md">
                        {destination.name}
                    </h1>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-stone-200 font-semibold">
                        {/* Rating */}
                        {destination.rating != null && (
                            <div className="flex items-center gap-1.5 drop-shadow">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-white">
                                    {destination.rating.toFixed(1)}
                                </span>
                                {destination.reviewCount != null && (
                                    <span className="text-stone-300 font-normal">
                                        ({destination.reviewCount.toLocaleString("id-ID")} Ulasan)
                                    </span>
                                )}
                            </div>
                        )}

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
            <div className="hidden md:flex flex-col gap-2 md:gap-3">
                {secondaryImages.slice(0, 2).map((img, idx) => (
                    <button
                        type="button"
                        key={idx}
                        onClick={() =>
                            onImageClick?.(globalIndexOf(img.imageUrl))
                        }
                        aria-label={`Lihat ${destination.name} foto ${idx + 2}`}
                        className="flex-1 bg-accent overflow-hidden rounded-xl relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        <Image
                            src={img.imageUrl}
                            alt={`${destination.name} ${idx + 2}`}
                            fill
                            sizes="25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {idx === 1 && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-1">
                                    <ImageIcon className="size-3.5" />
                                    Lihat Semua
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

