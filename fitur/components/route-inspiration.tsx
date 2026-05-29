import Image from "next/image";
import { Compass } from "lucide-react";
import { routes } from "@/fitur/data/landing";
import { SectionHeading } from "@/components/public/home/section-heading";

export function RouteInspiration() {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
            id="routes"
        >
            <SectionHeading
                action="Jelajahi Semua Rute"
                actionHref="#map"
                eyebrow="Ide perjalanan terkurasi untuk pengalaman maksimal."
                title="Inspirasi Rute"
            />
            <div className="mt-6 grid gap-6 md:grid-cols-3">
                {routes.map((route) => (
                    <article
                        className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/60 bg-white shadow-lg shadow-[#0f172a]/5"
                        key={route.title}
                    >
                        <Image
                            alt={route.title}
                            className="object-cover transition duration-500 group-hover:scale-105"
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            src={route.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                            <h3 className="font-heading text-lg font-bold">
                                {route.title}
                            </h3>
                            <p className="mt-2 flex items-center gap-1 text-xs">
                                <Compass className="size-3.5" />
                                {route.meta}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
