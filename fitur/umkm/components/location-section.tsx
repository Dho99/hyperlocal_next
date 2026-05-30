import { MapPin } from "lucide-react";
import type { UmkmDetail } from "@/lib/services/umkm-service";
import { ScrollReveal } from "./scroll-reveal";

interface LocationSectionProps {
    umkm: UmkmDetail;
}

export function LocationSection({ umkm }: LocationSectionProps) {
    const address = umkm.address || "Alamat tidak tersedia";
    const hasCoords = umkm.latitude && umkm.longitude;

    const mapsUrl = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${umkm.latitude},${umkm.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
        <ScrollReveal>
            <section>
                <h2 className="mb-3 text-xl font-bold text-emerald-900">
                    Lokasi
                </h2>
                <div className="rounded-lg border border-stone-200 p-5">
                    <div className="mb-4 flex items-start gap-2">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <p className="text-stone-700">{address}</p>
                    </div>

                    <div className="flex items-center justify-center rounded-lg bg-stone-200 h-48">
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 text-stone-500 hover:text-emerald-700 transition-colors"
                        >
                            <MapPin className="h-8 w-8" />
                            <span className="text-sm font-medium">
                                Buka Google Maps
                            </span>
                        </a>
                    </div>
                </div>
            </section>
        </ScrollReveal>
    );
}
