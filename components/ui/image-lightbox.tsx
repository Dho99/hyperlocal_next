"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LightboxImage {
    imageUrl: string;
    caption?: string | null;
}

export interface ImageLightboxController {
    open: boolean;
    index: number;
    openAt: (index: number) => void;
    setOpen: (open: boolean) => void;
    setIndex: (index: number) => void;
}

/**
 * State for an image lightbox. Share one instance across components (e.g. a hero
 * and a grid) so they open the same viewer, or let `PhotoGallery` create its own.
 */
export function useImageLightbox(): ImageLightboxController {
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);

    const openAt = React.useCallback((i: number) => {
        setIndex(i);
        setOpen(true);
    }, []);

    return { open, index, openAt, setOpen, setIndex };
}

interface ImageLightboxProps {
    images: LightboxImage[];
    open: boolean;
    index: number;
    onOpenChange: (open: boolean) => void;
    onIndexChange: (index: number) => void;
    /** Base label used for alt text / dialog title. */
    alt?: string;
}

export function ImageLightbox({
    images,
    open,
    index,
    onOpenChange,
    onIndexChange,
    alt,
}: ImageLightboxProps) {
    const count = images.length;
    const hasMultiple = count > 1;

    const goTo = React.useCallback(
        (next: number) => {
            if (count === 0) return;
            onIndexChange((next + count) % count);
        },
        [count, onIndexChange],
    );

    const goPrev = React.useCallback(() => goTo(index - 1), [goTo, index]);
    const goNext = React.useCallback(() => goTo(index + 1), [goTo, index]);

    React.useEffect(() => {
        if (!open || !hasMultiple) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goPrev();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                goNext();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, hasMultiple, goPrev, goNext]);

    const current = images[index];
    const currentAlt =
        current?.caption || (alt ? `${alt} ${index + 1}` : `Foto ${index + 1}`);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    className="fixed inset-0 z-50 flex flex-col text-white focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                >
                    <DialogPrimitive.Title className="sr-only">
                        {alt ? `Galeri foto ${alt}` : "Galeri foto"}
                    </DialogPrimitive.Title>

                    {/* Top bar: counter + close */}
                    <div className="flex shrink-0 items-center justify-between p-4">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                            {count > 0 ? `${index + 1} / ${count}` : "0"}
                        </span>
                        <DialogPrimitive.Close
                            aria-label="Tutup"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        >
                            <X className="h-5 w-5" />
                        </DialogPrimitive.Close>
                    </div>

                    {/* Main image */}
                    <div className="relative min-h-0 flex-1">
                        {current ? (
                            <Image
                                key={current.imageUrl}
                                src={current.imageUrl}
                                alt={currentAlt}
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-white/40">
                                <ImageOff className="h-16 w-16" />
                            </div>
                        )}

                        {hasMultiple && (
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    aria-label="Foto sebelumnya"
                                    className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    aria-label="Foto berikutnya"
                                    className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Caption */}
                    {current?.caption && (
                        <p className="shrink-0 px-6 pt-3 text-center text-sm text-white/80">
                            {current.caption}
                        </p>
                    )}

                    {/* Thumbnail strip */}
                    {hasMultiple && (
                        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 pb-4 pt-3">
                            {images.map((img, i) => (
                                <button
                                    type="button"
                                    key={`${img.imageUrl}-${i}`}
                                    onClick={() => onIndexChange(i)}
                                    aria-label={`Lihat foto ${i + 1}`}
                                    aria-current={i === index}
                                    className={cn(
                                        "relative h-16 w-20 shrink-0 overflow-hidden rounded-md ring-2 transition",
                                        i === index
                                            ? "ring-white"
                                            : "opacity-60 ring-transparent hover:opacity-100",
                                    )}
                                >
                                    <Image
                                        src={img.imageUrl}
                                        alt=""
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
