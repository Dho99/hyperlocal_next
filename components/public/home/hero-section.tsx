"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
    Search,
    Map,
    Utensils,
    ShieldCheck,
    MapPin,
    Star,
    ChevronRight,
    Loader2,
    AlertCircle,
} from "lucide-react";
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
            <Loader2 className="h-8 w-8 animate-spin text-[#6750a4]" />
        </div>
    ),
});

const statData = [
    { label: "Total Destinasi", value: "1,345", icon: Map },
    { label: "Total UMKM", value: "2,412", icon: Utensils },
    { label: "Sertifikasi Halal", value: "88%", icon: ShieldCheck },
];

const categories = [
    { label: "Wisata Alam", href: "#popular" },
    { label: "Kuliner Halal", href: "#facilities" },
    { label: "Masjid", href: "#nearby" },
    { label: "Penginapan", href: "#verified" },
];

export function HeroSection() {
    const router = useRouter();
    const [destinations, setDestinations] = useState<DashboardMapDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<DashboardMapDestination | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

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
                <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden" id="home">
            <div className="absolute inset-0 z-0">
                {loading ? (
                    <div className="h-full w-full bg-[#f2ecf4] animate-pulse flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#6750a4]" />
                    </div>
                ) : (
                    <HeroMapClient
                        destinations={destinations}
                        onMarkerClick={handleMarkerClick}
                    />
                )}
            </div>

            <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-white/15 via-transparent to-white/30" />

            <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                <div className="pointer-events-auto mx-auto w-full max-w-4xl text-center">
                    <p className="font-heading text-sm font-semibold text-[#6750a4]">
                        Eksplorasi berbasis data halal dan hyperlocal
                    </p>
                    <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-[#4f378a] sm:text-5xl lg:text-6xl">
                        Eksplorasi Halal Indonesia
                    </h1>
                    <form
                        action="#popular"
                        className="mx-auto mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-lg shadow-black/10 ring-1 ring-white/40 backdrop-blur-md"
                    >
                        <Search className="ml-3 size-5 shrink-0 text-[#7a7582]" />
                        <input
                            aria-label="Cari destinasi"
                            name="q"
                            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#7a7582]"
                            placeholder="Cari destinasi, kuliner, atau UMKM halal..."
                        />
                        <button
                            className="hidden h-12 rounded-xl bg-[#4f378a] px-6 text-sm font-bold text-white shadow-lg shadow-[#4f378a]/25 transition hover:bg-[#3f2a78] sm:block"
                            type="submit"
                        >
                            Cari Sekarang
                        </button>
                    </form>
                    <div className="pointer-events-auto mt-5 flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <a
                                key={cat.label}
                                href={cat.href}
                                className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#1d1b20] shadow-md ring-1 ring-white/40 backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-white/90"
                            >
                                {cat.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="pointer-events-auto mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-3">
                    {statData.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-4 rounded-xl border border-white/40 bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-lg"
                        >
                            <div className="flex size-11 items-center justify-center rounded-xl bg-[#4f378a] text-white">
                                <stat.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#494551]">
                                    {stat.label}
                                </p>
                                <p className="font-heading text-xl font-bold text-[#1d1b20]">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
        </section>
    );
}
