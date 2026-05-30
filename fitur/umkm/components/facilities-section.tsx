import { Building2, Utensils, Hotel, MapPin, Wifi, Car } from "lucide-react";
import type { ComponentType } from "react";
import type { FacilityInfo } from "@/lib/services/umkm-service";
import { ScrollReveal } from "./scroll-reveal";

interface FacilitiesSectionProps {
    facilities: FacilityInfo[];
}

const FACILITY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
    masjid: Building2,
    mosque: Building2,
    mushola: Building2,
    restaurant: Utensils,
    kuliner: Utensils,
    hotel: Hotel,
    penginapan: Hotel,
    parking: Car,
    parkir: Car,
    wifi: Wifi,
    toilet: MapPin,
};

function getIcon(type: string | null): ComponentType<{ className?: string }> {
    return FACILITY_ICONS[type?.toLowerCase() ?? ""] ?? Building2;
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
    if (facilities.length === 0) return null;

    return (
        <ScrollReveal>
            <section>
                <h2 className="mb-4 text-xl font-bold text-emerald-900">
                    Fasilitas
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {facilities.map((fac) => {
                        const Icon = getIcon(fac.type);
                        return (
                            <div
                                key={fac.id}
                                className="rounded-lg border border-stone-200 p-4"
                            >
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-medium text-stone-800">
                                    {fac.instanceName || fac.name}
                                </h3>
                                {fac.type && (
                                    <p className="mt-0.5 text-xs text-stone-500">
                                        {fac.type}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </ScrollReveal>
    );
}
