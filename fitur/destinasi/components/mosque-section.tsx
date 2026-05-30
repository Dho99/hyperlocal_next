import { Building2 } from "lucide-react";
import {
    formatDistance,
    type FacilityInfo,
} from "@/fitur/destinasi/data/destinasi-detail-data";

interface MosqueSectionProps {
    facilities: FacilityInfo[];
}

export function MosqueSection({ facilities }: MosqueSectionProps) {
    if (facilities.length === 0) return null;

    return (
        <section>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                Masjid dan Ruang Ibadah Terdekat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facilities.slice(0, 4).map((fac) => (
                    <div
                        key={fac.id}
                        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                            <Building2 className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-foreground">
                                {fac.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {formatDistance(fac.distance)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
