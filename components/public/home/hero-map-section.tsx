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
    DialogClose,
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
        router.push(`/destinasi/${selected.slug}`);
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
                <DialogContent className="sm:max-w-md w-[95vw] z-[9999] [&>button]:hidden p-5 rounded-2xl bg-[#faf6fc] border border-purple-100 shadow-xl">
                    <DialogDescription className="sr-only">
                        Detail destinasi {selected?.name}
                    </DialogDescription>
                    {selected && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-stretch">
                                {/* Left Column (Image) */}
                                <div className="relative w-full min-h-[170px] overflow-hidden rounded-2xl bg-slate-100 border border-purple-100/40 shadow-inner">
                                    {selected.image ? (
                                        <img
                                            src={selected.image}
                                            alt={`Foto ${selected.name}`}
                                            className="h-full w-full object-cover absolute inset-0"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium text-slate-500 absolute inset-0">
                                            Gambar tidak tersedia
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="flex flex-col justify-between py-0.5">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-[#1d1b20] leading-tight">
                                                {selected.name}
                                            </DialogTitle>
                                            <DialogClose className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors flex-shrink-0">
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Tutup</span>
                                            </DialogClose>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            {selected.category && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e1d4fd] px-2.5 py-1 text-xs font-semibold text-[#4f378a] w-fit">
                                                    <MapPin className="size-3" />
                                                    {selected.category}
                                                </span>
                                            )}
                                            {selected.status && (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold w-fit",
                                                        statusBadge(selected.status).cls,
                                                    )}
                                                >
                                                    <Star className="size-3" />
                                                    {statusBadge(selected.status).label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-1.5 pt-3 border-t border-purple-100/50">
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-[#494551] font-medium">Latitude</span>
                                            <span className="font-mono font-semibold text-[#1d1b20]">
                                                {selected.latitude.toFixed(6)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-[#494551] font-medium">Longitude</span>
                                            <span className="font-mono font-semibold text-[#1d1b20]">
                                                {selected.longitude.toFixed(6)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                type="button"
                                onClick={handleDetail}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#4f378a]/20 transition hover:bg-[#3f2a78]"
                            >
                                Lihat Detail
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
