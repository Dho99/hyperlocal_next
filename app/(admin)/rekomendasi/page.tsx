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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
const PRINT_PAGE_SIZE = 100;

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
        page: number;
        limit: number;
        totalPages: number;
        maxEngagement: number;
    };
}

function getPageNumbers(
    currentPage: number,
    totalPages: number,
): Array<number | "ellipsis"> {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([
        1,
        totalPages,
        currentPage,
        currentPage - 1,
        currentPage + 1,
    ]);
    const sorted = Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    const result: Array<number | "ellipsis"> = [];
    for (const page of sorted) {
        const previous = result[result.length - 1];
        if (typeof previous === "number" && page - previous > 1) {
            result.push("ellipsis");
        }
        result.push(page);
    }

    return result;
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

function GapRecommendationCard({
    item,
    maxEngagement,
}: {
    item: GapItem;
    maxEngagement: number;
}) {
    const style = SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.MEDIUM;
    const SeverityIcon = style.icon;

    return (
        <div className={`print-break-inside rounded-xl border border-stone-200 bg-white p-6 shadow-sm ${style.border} ${style.bg} print:shadow-none print:border-stone-300`}>
            <div className="flex items-start gap-4">
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
                            {item.type === "DESTINATION" ? "Destinasi" : "UMKM"}
                        </span>
                        {item.city && (
                            <span className="text-xs text-stone-400">
                                {item.city}
                            </span>
                        )}
                    </div>

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
                            <span className="text-stone-500">Interaksi: </span>
                            <span className="font-semibold text-stone-700">
                                {item.engagement.total}
                            </span>
                        </div>
                    </div>

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

                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-stone-700">
                        <strong>Rekomendasi Tindakan:</strong>{" "}
                        {item.actionText}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    total,
    limit,
    disabled,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    disabled: boolean;
    onPageChange: (page: number) => void;
}) {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="no-print flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-500">
                Menampilkan{" "}
                <span className="font-medium text-stone-700">
                    {start}–{end}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-stone-700">{total}</span>{" "}
                rekomendasi
            </p>
            <nav
                className="flex flex-wrap items-center gap-1"
                aria-label="Navigasi halaman rekomendasi"
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || page <= 1}
                    className="gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                {getPageNumbers(page, totalPages).map((entry, index) =>
                    entry === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-1 text-stone-400"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={entry}
                            variant={entry === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(entry)}
                            disabled={disabled}
                            aria-current={entry === page ? "page" : undefined}
                            className={
                                entry === page
                                    ? "min-w-9 bg-emerald-700 text-white hover:bg-emerald-800"
                                    : "min-w-9"
                            }
                        >
                            {entry}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || page >= totalPages}
                    className="gap-1"
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </nav>
        </div>
    );
}

export default function RekomendasiPage() {
    const [data, setData] = useState<GapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [printData, setPrintData] = useState<GapItem[] | null>(null);
    const [isPreparingPrint, setIsPreparingPrint] = useState(false);

    const fetchData = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/admin/analytics/gap-analysis?page=${targetPage}&limit=${PAGE_SIZE}`,
            );
            if (!res.ok) throw new Error("Gagal memuat data");
            const json: GapResponse = await res.json();
            setData(json);
            if (json.meta.page !== targetPage) setPage(json.meta.page);
        } catch {
            setError("Gagal memuat data rekomendasi. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchData(page);
    }, [fetchData, page]);

    const handlePageChange = useCallback((nextPage: number) => {
        setPage(nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handlePrint = useCallback(async () => {
        if (!data || data.meta.total <= PAGE_SIZE) {
            window.print();
            return;
        }

        setIsPreparingPrint(true);
        try {
            const printPageCount = Math.ceil(
                data.meta.total / PRINT_PAGE_SIZE,
            );
            const responses = await Promise.all(
                Array.from({ length: printPageCount }, async (_, index) => {
                    const res = await fetch(
                        `/api/admin/analytics/gap-analysis?page=${index + 1}&limit=${PRINT_PAGE_SIZE}`,
                    );
                    if (!res.ok) throw new Error("Gagal menyiapkan laporan");
                    return (await res.json()) as GapResponse;
                }),
            );

            setPrintData(responses.flatMap((response) => response.data));
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve()),
                );
            });
            window.print();
        } catch {
            window.print();
        } finally {
            setPrintData(null);
            setIsPreparingPrint(false);
        }
    }, [data]);

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

            <div className="print-full space-y-8 px-4 py-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 no-print sm:flex-row sm:items-start sm:justify-between">
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
                        onClick={() => void handlePrint()}
                        disabled={isPreparingPrint || loading || !data || Boolean(error)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 w-full sm:w-auto"
                    >
                        {isPreparingPrint ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Printer className="h-4 w-4" />
                        )}
                        {isPreparingPrint
                            ? "Menyiapkan Laporan..."
                            : "Cetak Laporan PDF"}
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
                {data && !loading && !error && (
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
                            onClick={() => void fetchData(page)}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                        >
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {/* Empty state */}
                {data && data.data.length === 0 && !loading && !error && (
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
                {data && data.data.length > 0 && !loading && !error && (
                    <div
                        className={`space-y-4 print-full ${
                            printData ? "print:hidden" : ""
                        }`}
                    >
                        <h2 className="text-lg font-semibold text-stone-800 print:text-xl">
                            Daftar Rekomendasi Tindakan
                        </h2>
                        {data.data.map((item) => (
                            <GapRecommendationCard
                                key={`${item.type}-${item.id}`}
                                item={item}
                                maxEngagement={data.meta.maxEngagement}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && !error && (
                    <Pagination
                        page={data.meta.page}
                        totalPages={data.meta.totalPages}
                        total={data.meta.total}
                        limit={data.meta.limit}
                        disabled={loading}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Full report rendered only while printing */}
                {printData && (
                    <div className="hidden print:block space-y-4 print-full">
                        <h2 className="text-xl font-semibold text-stone-800">
                            Daftar Rekomendasi Tindakan
                        </h2>
                        {printData.map((item) => (
                            <GapRecommendationCard
                                key={`print-${item.type}-${item.id}`}
                                item={item}
                                maxEngagement={data?.meta.maxEngagement ?? 0}
                            />
                        ))}
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
