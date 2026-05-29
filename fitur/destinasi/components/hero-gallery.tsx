import Image from "next/image";
import { Heart, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/fitur/destinasi/data/destinasi-detail-data";

interface HeroGalleryProps {
    primaryImage: string | null;
    secondaryImages: GalleryImage[];
    name: string;
    saved: boolean;
    onSave: () => void;
    heroLoaded: boolean;
    onHeroLoad: () => void;
}

export function HeroGallery({
    primaryImage,
    secondaryImages,
    name,
    saved,
    onSave,
    heroLoaded,
    onHeroLoad,
}: HeroGalleryProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 h-auto md:h-[614px] rounded-xl overflow-hidden shadow-md">
            <div className="md:col-span-3 bg-accent relative group min-h-[280px] md:min-h-0">
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
                <button
                    type="button"
                    onClick={onSave}
                    aria-pressed={saved}
                    aria-label={
                        saved ? "Hapus dari simpanan" : "Simpan destinasi"
                    }
                    className={cn(
                        "absolute top-4 right-4 bg-background/70 backdrop-blur-md p-2 rounded-full transition-colors shadow-sm",
                        saved
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary",
                    )}
                >
                    <Heart
                        className={cn("size-5", saved && "fill-current")}
                    />
                </button>
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
