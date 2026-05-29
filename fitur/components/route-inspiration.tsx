import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";
import type { RouteIdea } from "@/fitur/data/landing-data";
import { SectionHeading } from "@/components/public/home/section-heading";

interface RouteInspirationProps {
    items: RouteIdea[];
}

export function RouteInspiration({ items }: RouteInspirationProps) {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="routes"
        >
            <SectionHeading
                action="Jelajahi Semua"
                actionHref="/destinasi"
                eyebrow="Ide perjalanan dibuat dari wilayah destinasi populer."
                title="Inspirasi Rute"
            />
            <div className="mt-6 grid gap-6 md:grid-cols-3">
                {items.map((route) => (
                    <Link
                        className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/60 bg-white shadow-lg shadow-[#0f172a]/5"
                        href={`/destinasi?search=${encodeURIComponent(route.location)}`}
                        key={route.location}
                    >
                        {route.imageUrl ? (
                            <Image
                                alt={route.name}
                                className="object-cover transition duration-500 group-hover:scale-105"
                                fill
                                sizes="(min-width: 768px) 33vw, 100vw"
                                src={route.imageUrl}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-[#e9ddff]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                            <h3 className="font-heading text-lg font-bold">
                                Jelajah {route.location}
                            </h3>
                            <p className="mt-2 flex items-center gap-1 text-xs">
                                <Compass className="size-3.5" />
                                Berawal dari {route.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
