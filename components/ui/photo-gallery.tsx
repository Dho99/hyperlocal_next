"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import {
    ImageLightbox,
    useImageLightbox,
    type ImageLightboxController,
    type LightboxImage,
} from "@/components/ui/image-lightbox";

interface PhotoGalleryProps {
    images: LightboxImage[];
    name: string;
    /** Optional section heading rendered above the grid. */
    heading?: string;
    className?: string;
    /**
     * Share a lightbox with another component (e.g. a hero). When provided, the
     * parent is responsible for rendering <ImageLightbox/>. Otherwise this grid
     * manages its own.
     */
    controller?: ImageLightboxController;
    /**
     * Minimum number of images required to render the grid. Defaults to 1.
     * Destinasi passes 2 because its hero already shows the first image.
     */
    minImages?: number;
}

export function PhotoGallery({
    images,
    name,
    heading,
    className,
    controller,
    minImages = 1,
}: PhotoGalleryProps) {
    const internal = useImageLightbox();
    const lb = controller ?? internal;

    if (!images || images.length < minImages) return null;

    return (
        <section className={className}>
            {heading && (
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {heading}
                </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                    <button
                        type="button"
                        key={`${img.imageUrl}-${idx}`}
                        onClick={() => lb.openAt(idx)}
                        aria-label={`Lihat ${name} foto ${idx + 1}`}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Image
                            src={img.imageUrl}
                            alt={img.caption || `${name} ${idx + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className={cn(
                                "object-cover transition-transform duration-300 group-hover:scale-105",
                            )}
                        />
                    </button>
                ))}
            </div>

            {/* Self-contained: render the viewer here. When a controller is shared,
                the parent renders <ImageLightbox/> instead. */}
            {!controller && (
                <ImageLightbox
                    images={images}
                    open={lb.open}
                    index={lb.index}
                    onOpenChange={lb.setOpen}
                    onIndexChange={lb.setIndex}
                    alt={name}
                />
            )}
        </section>
    );
}
