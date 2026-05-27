"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle, Map, ChevronRight, MapPin, Star } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { DashboardMapDestination } from "@/types/map-viewer";
import { cn } from "@/lib/utils";

const HeroMapClient = dynamic(() => import("./hero-map-client"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-[#f2ecf4] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#6750a4]" />
                <p className="text-sm font-medium text-[#494551]">Memuat Peta...</p>
            </div>
        </div>
    ),
});

export function HeroMapSection() {
    const router = useRouter();
    const [destinations, setDestinations] = useState<DashboardMapDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<DashboardMapDestination | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);

    const fetchMapData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Gagal memuat data peta");
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

    const handleMarkerClick = useCallback((dest: DashboardMapDestination) => {
        setSelected(dest);
        setDialogOpen(true);
    }, []);

    const handleDetail = useCallback(() => {
        if (!selected) return;
        setDialogOpen(false);
        router.push(`/destinasi/${selected.id}`);
    }, [selected, router]);

    const statusBadge = (status?: string) => {
        if (status === "APPROVED") return { label: "Terverifikasi", cls: "bg-emerald-100 text-emerald-800" };
        if (status === "REJECTED") return { label: "Ditolak", cls: "bg-red-100 text-red-800" };
        return { label: "Pending", cls: "bg-amber-100 text-amber-800" };
    };

    if (error) {
        return (
            <div className="h-full w-full bg-red-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <div className="relative z-0 isolate h-full w-full">
                <HeroMapClient
                    destinations={destinations}
                    onMarkerClick={handleMarkerClick}
                />
            </div>

            {panelOpen && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center p-4 sm:p-6 lg:p-10">
                    <div className="pointer-events-auto max-w-sm rounded-xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-black/10 backdrop-blur-md sm:p-8">
                        <button
                            type="button"
                            onClick={() => setPanelOpen(false)}
                            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-[#494551] hover:bg-[#f2ecf4] transition-colors"
                            aria-label="Tutup panel"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#e1d4fd] text-[#4f378a]">
                            <Map className="size-5" />
                        </div>

                        <h2 className="mt-5 font-heading text-2xl font-bold text-[#1d1b20]">
                            Eksplorasi Peta Interaktif
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[#494551]">
                            Temukan titik-titik lokasi wisata halal, restoran
                            bersertifikat, dan masjid terdekat langsung dari
                            pandangan udara. Klik marker untuk melihat detail.
                        </p>
                        <p className="mt-3 text-xs font-medium text-[#6750a4]">
                            {destinations.length} destinasi tersedia
                        </p>
                    </div>
                </div>
            )}

            {!panelOpen && (
                <button
                    type="button"
                    onClick={() => setPanelOpen(true)}
                    className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#4f378a] shadow-lg backdrop-blur-md transition hover:bg-white"
                >
                    <Map className="size-4" />
                    Buka Panel
                </button>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-sm z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl">
                            {selected?.name || "Destinasi"}
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-4 pt-2">
                                {selected && (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {selected.category && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e1d4fd] px-3 py-1 text-xs font-semibold text-[#4f378a]">
                                                    <MapPin className="size-3" />
                                                    {selected.category}
                                                </span>
                                            )}
                                            {selected.status && (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                                                        statusBadge(selected.status).cls,
                                                    )}
                                                >
                                                    <Star className="size-3" />
                                                    {statusBadge(selected.status).label}
                                                </span>
                                            )}
                                        </div>

                                        <div className="rounded-lg bg-[#f8f2fa] p-3 space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-[#494551]">Latitude</span>
                                                <span className="font-mono font-medium text-[#1d1b20]">
                                                    {selected.latitude.toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-[#494551]">Longitude</span>
                                                <span className="font-mono font-medium text-[#1d1b20]">
                                                    {selected.longitude.toFixed(6)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleDetail}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#4f378a]/20 transition hover:bg-[#3f2a78]"
                                        >
                                            Lihat Detail
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}
