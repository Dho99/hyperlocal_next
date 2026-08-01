import { cn } from "@/lib/utils";
import {
    getFacilityIcon,
    getFacilityIconBg,
    formatDistance,
    type FacilityInfo,
} from "@/fitur/destinasi/data/destinasi-detail-data";

interface FacilitiesSectionProps {
    facilities: FacilityInfo[];
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
    if (facilities.length === 0) return null;

    return (
        <section>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                Fasilitas Terdekat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {facilities.map((fac) => {
                    const Icon = getFacilityIcon(fac.type);
                    const iconBg = getFacilityIconBg(fac.type);
                    return (
                        <div
                            key={fac.id}
                            className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                                    iconBg,
                                )}
                            >
                                <Icon className="size-6" />
                            </div>
                            <h3 className="font-bold text-sm mb-1 text-foreground line-clamp-1">
                                {fac.instanceName || fac.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {formatDistance(fac.distance)}
                                {fac.travelMinutes != null
                                    ? ` • ±${fac.travelMinutes} menit`
                                    : ""}
                                {fac.type ? ` • ${fac.type}` : ""}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
