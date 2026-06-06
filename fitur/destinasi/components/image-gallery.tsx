import Image from "next/image";
import type { GalleryImage } from "@/fitur/destinasi/data/destinasi-detail-data";

interface ImageGalleryProps {
    images: GalleryImage[];
    name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
    if (!images || images.length <= 1) return null;

    return (
        <section>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                Galeri Foto
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-xl bg-accent"
                    >
                        <Image
                            src={img.imageUrl}
                            alt={`${name} ${idx + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
