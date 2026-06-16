"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Loader2,
    Lightbulb,
    Printer,
    AlertTriangle,
    MapPin,
    Store,
    TrendingUp,
    AlertCircle,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EngagementMetrics {
    views: number;
    saves: number;
    clicks: number;
    reviews: number;
    total: number;
}

interface DestinationGapItem {
    id: string;
    name: string;
    slug: string;
    type: "DESTINATION";
    city: string | null;
    imageUrl: string | null;
    status: string;
    validatedScore: number | null;
    halalScore: number | null;
    engagement: EngagementMetrics;
    severity: "HIGH" | "MEDIUM";
    actionText: string;
}

interface UmkmGapItem {
    id: string;
    name: string;
    slug: string;
    type: "UMKM";
    city: string | null;
    imageUrl: string | null;
    status: string;
    validationStatus: string;
    engagement: EngagementMetrics;
    severity: "HIGH" | "MEDIUM";
    actionText: string;
}

type GapItem = DestinationGapItem | UmkmGapItem;

interface GapResponse {
    data: GapItem[];
    meta: {
        total: number;
        highPriority: number;
        threshold: number;
    };
}

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-6">
            <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-stone-200" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-stone-200" />
                    <div className="h-4 w-1/2 rounded bg-stone-200" />
                    <div className="h-4 w-full rounded bg-stone-200" />
                    <div className="h-4 w-5/6 rounded bg-stone-200" />
                </div>
            </div>
        </div>
    );
}

const SEVERITY_STYLES: Record<
    string,
    { border: string; bg: string; badge: string; icon: typeof AlertTriangle; label: string }
> = {
    HIGH: {
        border: "border-l-4 border-red-400",
        bg: "bg-red-50/30",
        badge: "bg-red-100 text-red-700 border-red-300",
        icon: AlertCircle,
        label: "Prioritas Tinggi",
    },
    MEDIUM: {
        border: "border-l-4 border-amber-400",
        bg: "bg-amber-50/30",
        badge: "bg-amber-100 text-amber-700 border-amber-300",
        icon: AlertTriangle,
        label: "Prioritas Sedang",
    },
};

function EngagementBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-stone-200">
                <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-medium text-stone-600 w-8 text-right">
                {value}
            </span>
        </div>
    );
}

export default function RekomendasiPage() {
    const [data, setData] = useState<GapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/analytics/gap-analysis");
            if (!res.ok) throw new Error("Gagal memuat data");
            const json = await res.json();
            setData(json);
        } catch {
            setError("Gagal memuat data rekomendasi. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    return (
        <>
            <style>{`
                @media print {
                    nav, header, .sidebar, .navbar, .no-print { display: none !important; }
                    .print-full { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .print-break-inside { break-inside: avoid; }
                    body { background: white !important; }
                }
            `}</style>

            <div className="print-full space-y-8 p-8">
                {/* Header */}
                <div className="flex items-start justify-between no-print">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-stone-900">
                            Rekomendasi & Laporan
                        </h1>
                        <p className="text-sm text-stone-500">
                            Analisis kesenjangan antara interaksi publik dan skor
                            validasi destinasi & UMKM.
                        </p>
                    </div>
                    <Button
                        onClick={() => window.print()}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak Laporan PDF
                    </Button>
                </div>

                {/* Print-only header */}
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-2xl font-bold text-stone-900">
                        Laporan Rekomendasi Pengembangan Destinasi
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                        Dinas Pariwisata & Ekonomi Kreatif
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                        Dicetak pada {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>

                {/* Summary stats */}
                {data && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print-full">
                        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm print:border-stone-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">
                                        {data.meta.highPriority}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        Prioritas Tinggi
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm print:border-stone-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">
                                        {data.meta.total}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        Total Kesenjangan Terdeteksi
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm print:border-stone-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">
                                        {data.meta.threshold}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        Ambang Interaksi Tinggi (P75)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
                        <p className="mt-3 text-sm text-red-600">{error}</p>
                        <Button
                            onClick={fetchData}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {/* Empty state */}
                {data && data.data.length === 0 && !loading && (
                    <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
                        <Lightbulb className="mx-auto h-12 w-12 text-stone-300" />
                        <h3 className="mt-4 text-lg font-semibold text-stone-700">
                            Tidak Ditemukan Kesenjangan
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Semua destinasi dan UMKM dengan interaksi tinggi telah
                            memiliki skor validasi yang baik.
                        </p>
                    </div>
                )}

                {/* Recommendation cards */}
                {data && data.data.length > 0 && !loading && (
                    <div className="space-y-4 print-full">
                        <h2 className="text-lg font-semibold text-stone-800 print:text-xl">
                            Daftar Rekomendasi Tindakan
                        </h2>
                        {data.data.map((item) => {
                            const style = SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.MEDIUM;
                            const SeverityIcon = style.icon;
                            const maxEngagement = data.data.reduce(
                                (m, i) => Math.max(m, i.engagement.total),
                                0,
                            );
                            return (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className={`print-break-inside rounded-xl border border-stone-200 bg-white p-6 shadow-sm ${style.border} ${style.bg} print:shadow-none print:border-stone-300`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                                item.type === "DESTINATION"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            }`}
                                        >
                                            {item.type === "DESTINATION" ? (
                                                <MapPin className="h-5 w-5" />
                                            ) : (
                                                <Store className="h-5 w-5" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Header row */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-stone-900">
                                                    {item.name}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${style.badge}`}
                                                >
                                                    <SeverityIcon className="h-3 w-3" />
                                                    {style.label}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                                                    {item.type === "DESTINATION"
                                                        ? "Destinasi"
                                                        : "UMKM"}
                                                </span>
                                                {item.city && (
                                                    <span className="text-xs text-stone-400">
                                                        {item.city}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Score info */}
                                            <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                                {"validatedScore" in item && (
                                                    <div>
                                                        <span className="text-stone-500">
                                                            Validated Score:{" "}
                                                        </span>
                                                        <span
                                                            className={`font-semibold ${
                                                                item.validatedScore == null
                                                                    ? "text-stone-400"
                                                                    : item.validatedScore < 60
                                                                      ? "text-red-600"
                                                                      : "text-emerald-600"
                                                            }`}
                                                        >
                                                            {item.validatedScore != null
                                                                ? `${item.validatedScore}/100`
                                                                : "Belum dinilai"}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.type === "DESTINATION" &&
                                                    "halalScore" in item &&
                                                    item.halalScore != null && (
                                                        <div>
                                                            <span className="text-stone-500">
                                                                Halal Score:{" "}
                                                            </span>
                                                            <span className="font-semibold text-stone-700">
                                                                {item.halalScore}/100
                                                            </span>
                                                        </div>
                                                    )}
                                                <div>
                                                    <span className="text-stone-500">
                                                        Interaksi:{" "}
                                                    </span>
                                                    <span className="font-semibold text-stone-700">
                                                        {item.engagement.total}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Engagement bars */}
                                            <div className="mb-3 space-y-1">
                                                {item.engagement.views > 0 && (
                                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                                        <span className="w-12">Views</span>
                                                        <EngagementBar
                                                            value={item.engagement.views}
                                                            max={maxEngagement}
                                                        />
                                                    </div>
                                                )}
                                                {item.engagement.saves > 0 && (
                                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                                        <span className="w-12">Saves</span>
                                                        <EngagementBar
                                                            value={item.engagement.saves}
                                                            max={maxEngagement}
                                                        />
                                                    </div>
                                                )}
                                                {item.engagement.reviews > 0 && (
                                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                                        <span className="w-12">Reviews</span>
                                                        <EngagementBar
                                                            value={item.engagement.reviews}
                                                            max={maxEngagement}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action text */}
                                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-stone-700">
                                                <strong>Rekomendasi Tindakan:</strong>{" "}
                                                {item.actionText}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Print footer */}
                <div className="hidden print:block text-center text-xs text-stone-400 mt-8 pt-4 border-t border-stone-200">
                    <p>
                        Laporan ini dihasilkan secara otomatis dari sistem
                        analisis data Dinas Pariwisata & Ekonomi Kreatif.
                    </p>
                    <p className="mt-1">
                        Data diperbaharui secara berkala berdasarkan interaksi
                        pengguna dan hasil validasi.
                    </p>
                </div>
            </div>
        </>
    );
}
