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

function PhotoValidityBadge({
    validity,
}: {
    validity: FacilityInfo["photoValidity"];
}) {
    if (!validity) {
        return (
            <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Belum ada bukti foto
            </span>
        );
    }
    if (validity.invalidPosition > 0) {
        return (
            <span className="mt-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                Bukti foto di luar radius
            </span>
        );
    }
    if (validity.invalidTime > 0) {
        return (
            <span className="mt-2 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                Waktu foto tidak wajar
            </span>
        );
    }
    if (validity.valid === validity.total) {
        return (
            <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Bukti foto valid ({validity.valid}/{validity.total})
            </span>
        );
    }
    return (
        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Sebagian bukti tanpa metadata
        </span>
    );
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
                            <div className="flex">
                                <PhotoValidityBadge
                                    validity={fac.photoValidity}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
