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
import { HeroSearch } from "./hero-search";
import { TopographicPattern } from "@/components/ui/topographic-pattern";

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
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
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
                                        <div className="rounded-lg bg-stone-50 p-3 space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-stone-600">Latitude</span>
                                                <span className="font-mono font-medium text-stone-900">
                                                    {selected.latitude.toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-stone-600">Longitude</span>
                                                <span className="font-mono font-medium text-stone-900">
                                                    {selected.longitude.toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDetail}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
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
