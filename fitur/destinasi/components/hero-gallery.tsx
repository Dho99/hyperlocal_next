import Image from "next/image";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/destinations/bookmark-button";
import type { GalleryImage } from "@/fitur/destinasi/data/destinasi-detail-data";

interface HeroGalleryProps {
    primaryImage: string | null;
    secondaryImages: GalleryImage[];
    name: string;
    heroLoaded: boolean;
    onHeroLoad: () => void;
    onBack: () => void;
    destinationId: string;
}

export function HeroGallery({
    primaryImage,
    secondaryImages,
    name,
    heroLoaded,
    onHeroLoad,
    onBack,
    destinationId,
}: HeroGalleryProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,220px)] gap-2 md:gap-3 h-auto md:h-[614px] rounded-xl overflow-hidden shadow-md">
            <div className="bg-accent relative group min-h-[280px] md:min-h-0">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Kembali ke Destinasi"
                    className="absolute top-4 left-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white/90 text-foreground shadow-sm transition hover:bg-emerald-50 backdrop-blur-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={name}
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
                <div className="absolute top-4 right-4">
                    <BookmarkButton
                        targetSlug={destinationId}
                        targetType="DESTINASI"
                        showLabel={false}
                    />
                </div>
            </div>
            <div className="hidden md:flex flex-col gap-2 md:gap-3">
                {secondaryImages.slice(0, 2).map((img, idx) => (
                    <div
                        key={idx}
                        className="flex-1 bg-accent overflow-hidden rounded-xl relative group"
                    >
                        <Image
                            src={img.imageUrl}
                            alt={`${name} ${idx + 2}`}
                            fill
                            sizes="25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {idx === 1 && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                                <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-1">
                                    <ImageIcon className="size-3.5" />
                                    Lihat Semua
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
