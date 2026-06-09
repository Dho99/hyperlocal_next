"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Map,
    Utensils,
    ShieldCheck,
    MapPin,
    Star,
    ChevronRight,
    Loader2,
    AlertCircle,
    X,
} from "lucide-react";
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
import { HeroSearch } from "./hero-search";
import { TopographicPattern } from "@/components/ui/topographic-pattern";

const DEFAULT_DESTINATION_IMAGE =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='320' height='180' fill='%23e2e8f0'/><text x='160' y='92' dominant-baseline='middle' text-anchor='middle' fill='%2372757a' font-family='system-ui, sans-serif' font-size='16'>No%20Image</text></svg>";

const HeroMapClient = dynamic(() => import("./hero-map-client"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-900" />
        </div>
    ),
});

const iconMap = {
    map: Map,
    utensils: Utensils,
    shield: ShieldCheck,
} as const;

const defaultStats = [
    { label: "Total Destinasi", value: "0", icon: "map" as const },
    { label: "Total UMKM", value: "0", icon: "utensils" as const },
    { label: "Terverifikasi", value: "0%", icon: "shield" as const },
];

const statsContainerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12 },
    },
};

const statsItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroSection({ stats = defaultStats }: { stats?: { label: string; value: string; icon: "map" | "utensils" | "shield" }[] }) {
    const router = useRouter();
    const [destinations, setDestinations] = useState<DashboardMapDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<DashboardMapDestination | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
        queueMicrotask(fetchMapData);
    }, [fetchMapData]);

    const availableCategories = useMemo(() => {
        const cats = new Set(destinations.map((d) => d.category).filter(Boolean));
        return Array.from(cats) as string[];
    }, [destinations]);

    const filteredDestinations = useMemo(() => {
        if (!activeCategory) return destinations;
        return destinations.filter((d) => d.category === activeCategory);
    }, [destinations, activeCategory]);

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
                    <div className="h-full w-full bg-stone-100 animate-pulse flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-900" />
                    </div>
                ) : (
                    <HeroMapClient
                        destinations={filteredDestinations}
                        onMarkerClick={handleMarkerClick}
                    />
                )}
            </div>

            <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-stone-50/20 via-transparent to-stone-50/30" />
            <TopographicPattern className="pointer-events-none absolute inset-0 z-[1] select-none text-emerald-900" />

            <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pointer-events-auto mx-auto w-full max-w-4xl text-center"
                >
                    <p className="font-heading text-sm font-semibold text-emerald-900">
                        Eksplorasi berbasis data halal dan hyperlocal
                    </p>
                    <h1 className="mt-3 font-heading text-4xl font-bold leading-tight tracking-tighter text-emerald-900 sm:text-5xl lg:text-6xl">
                        Eksplorasi Halal Indonesia
                    </h1>
                    <HeroSearch />
                    <div className="pointer-events-auto mt-5 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md ring-1 ring-white/40 backdrop-blur-lg transition hover:-translate-y-0.5",
                                activeCategory === null
                                    ? "bg-emerald-900 text-white"
                                    : "bg-white/70 text-stone-900 hover:bg-white/90",
                            )}
                        >
                            Semua
                        </button>
                        {availableCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() =>
                                    setActiveCategory(
                                        cat === activeCategory ? null : cat,
                                    )
                                }
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md ring-1 ring-white/40 backdrop-blur-lg transition hover:-translate-y-0.5",
                                    activeCategory === cat
                                        ? "bg-emerald-900 text-white"
                                        : "bg-white/70 text-stone-900 hover:bg-white/90",
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    variants={statsContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="pointer-events-auto mt-10 grid w-full max-w-4xl gap-4 md:grid-cols-3"
                >
                    {stats.map((stat) => {
                        const StatIcon = iconMap[stat.icon];
                        return (
                            <motion.div
                                key={stat.label}
                                variants={statsItemVariants}
                                className="flex items-center gap-4 rounded-xl border border-white/30 bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"
                            >
                                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-900 text-white">
                                    <StatIcon className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
                                        {stat.label}
                                    </p>
                                    <p className="font-heading text-xl font-bold text-stone-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md w-[95vw] z-[9999] [&>button]:hidden p-5 rounded-2xl bg-white border border-stone-200/60 shadow-xl">
                    <DialogDescription className="sr-only">
                        Detail destinasi {selected?.name}
                    </DialogDescription>
                    {selected && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-stretch">
                                {/* Left Column (Image) */}
                                <div className="relative w-full min-h-[170px] overflow-hidden rounded-2xl bg-stone-100 border border-stone-200/50 shadow-inner">
                                    <img
                                        src={selected.image ?? DEFAULT_DESTINATION_IMAGE}
                                        alt={selected.image ? `Foto ${selected.name}` : "Placeholder destinasi"}
                                        className="h-full w-full object-cover absolute inset-0"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Right Column */}
                                <div className="flex flex-col justify-between py-0.5">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                                                {selected.name}
                                            </DialogTitle>
                                            <DialogClose className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors flex-shrink-0">
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Tutup</span>
                                            </DialogClose>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            {selected.category && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 w-fit">
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

                                    <div className="mt-4 space-y-1.5 pt-3 border-t border-stone-100">
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-stone-500 font-medium">Latitude</span>
                                            <span className="font-mono font-semibold text-stone-850">
                                                {selected.latitude.toFixed(6)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs sm:text-sm">
                                            <span className="text-stone-500 font-medium">Longitude</span>
                                            <span className="font-mono font-semibold text-stone-850">
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
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
                            >
                                Lihat Detail
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
