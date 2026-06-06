import { MapPin } from "lucide-react";
import type { UmkmDetail } from "@/lib/services/umkm-service";
import { ScrollReveal } from "./scroll-reveal";
import { ReadonlyMap } from "@/components/maps";

interface LocationSectionProps {
    umkm: UmkmDetail;
}

export function LocationSection({ umkm }: LocationSectionProps) {
    const address = umkm.address || "Alamat tidak tersedia";
    const hasCoords = umkm.latitude && umkm.longitude;

    const mapsUrl = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${umkm.latitude as number},${umkm.longitude as number}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
        <ScrollReveal>
            <section>
                <h2 className="mb-3 text-xl font-bold text-emerald-900">
                    Lokasi
                </h2>
                <div className="rounded-lg border border-stone-200 p-5">
                    <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <p className="text-stone-700">{address}</p>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
                        {hasCoords ? (
                            <ReadonlyMap
                                className="h-[250px] w-full"
                                markers={[
                                    {
                                        id: umkm.id,
                                        latitude: umkm.latitude as number,
                                        longitude: umkm.longitude as number,
                                        title: umkm.name,
                                        subtitle: address,
                                    },
                                ]}
                            />
                        ) : (
                            <div className="flex h-[250px] items-center justify-center bg-stone-100">
                                <p className="text-sm text-stone-500">
                                    Peta tidak tersedia
                                </p>
                            </div>
                        )}
                    </div>

                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                        <MapPin className="h-4 w-4" />
                        Buka di Google Maps
                    </a>
                </div>
            </section>
        </ScrollReveal>
    );
}
