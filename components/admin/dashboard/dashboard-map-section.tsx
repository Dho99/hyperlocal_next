"use client";

import { useEffect, useState, useCallback } from "react";
import { DynamicDashboardMap } from "@/components/maps";
import type { DashboardMapDestination } from "@/types/map-viewer";
import { Loader2, AlertCircle } from "lucide-react";

export function DashboardMapSection() {
    const [destinations, setDestinations] = useState<DashboardMapDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMapData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) {
                throw new Error("Gagal memuat data peta");
            }
            const json = await res.json();
            const raw: DashboardMapDestination[] = json.data ?? [];

            const valid = raw.filter(
                (d) =>
                    d.latitude != null &&
                    d.longitude != null &&
                    !isNaN(d.latitude) &&
                    !isNaN(d.longitude) &&
                    d.latitude >= -90 &&
                    d.latitude <= 90 &&
                    d.longitude >= -180 &&
                    d.longitude <= 180,
            );

            setDestinations(valid);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMapData();
    }, [fetchMapData]);

    if (loading) {
        return (
            <div className="h-[320px] sm:h-[480px] w-full bg-muted animate-pulse flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Memuat Peta...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[320px] sm:h-[480px] w-full bg-red-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[320px] sm:h-[480px] w-full">
            <DynamicDashboardMap destinations={destinations} />
        </div>
    );
}
