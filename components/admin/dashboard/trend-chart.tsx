"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrendPoint {
    period: string;
    label: string;
    year: number;
    month: number;
    bookmarks: number;
    whatsappClicks: number;
    routeClicks: number;
    totalViews: number;
}

type TooltipData = {
    period: string;
    bookmarks: number;
    whatsappClicks: number;
    routeClicks: number;
    totalViews: number;
} | null;

const METRICS = [
    { key: "bookmarks" as const, label: "Bookmark", color: "#047857" },
    {
        key: "whatsappClicks" as const,
        label: "Klik WhatsApp",
        color: "#25D366",
    },
    { key: "routeClicks" as const, label: "Rute", color: "#c9a74d" },
    { key: "totalViews" as const, label: "Kunjungan", color: "#0f766e" },
];

export default function TrendChart() {
    const [data, setData] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipData>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const fetchTrends = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/analytics/trends");
            if (!res.ok) throw new Error("Gagal memuat data");
            const json = await res.json();
            setData(json.data || []);
            setError(null);
            setLastRefreshed(new Date());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTrends();
        const interval = setInterval(fetchTrends, 30000);
        return () => clearInterval(interval);
    }, [fetchTrends]);

    const maxValue = Math.max(
        1,
        ...data.map(
            (d) =>
                d.bookmarks + d.whatsappClicks + d.routeClicks + d.totalViews,
        ),
    );

    const formatTime = (date: Date) =>
        date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <Card className="flex h-full min-h-[340px] flex-col rounded-xl border-[#d7e5dc] bg-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#d7e5dc] px-5 py-4">
                <div className="min-w-0">
                    <CardTitle className="font-heading text-lg font-semibold">
                        Tren Interaksi
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-[#494551]">
                        Aktivitas pengguna 6 bulan terakhir.
                    </CardDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {lastRefreshed && (
                        <span className="text-xs text-[#494551]">
                            {formatTime(lastRefreshed)}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchTrends}
                        disabled={loading}
                        className="h-8 w-8 text-[#047857]"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-5">
                {/* Legend */}
                <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:flex sm:flex-wrap">
                    {METRICS.map((m) => (
                        <div key={m.key} className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: m.color }}
                            />
                            <span className="truncate text-xs text-[#494551]">
                                {m.label}
                            </span>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-1 items-end gap-2 rounded-lg bg-[#f7fbf8] px-3 pb-3 pt-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-1 flex-col items-center gap-2"
                            >
                                <div className="flex h-28 w-full max-w-10 items-end rounded-lg bg-white/80 p-1">
                                    <div
                                        className="w-full animate-pulse rounded-md bg-[#dbe7df]"
                                        style={{ height: `${60}%` }}
                                    />
                                </div>
                                <span className="h-3 w-8 animate-pulse rounded bg-[#dbe7df]" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg bg-[#f7fbf8] text-[#93000a]">
                        <AlertCircle className="h-6 w-6" />
                        <p className="text-sm font-medium">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchTrends}
                            className="border-[#d7e5dc] text-[#047857]"
                        >
                            Coba Lagi
                        </Button>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-lg bg-[#f7fbf8] text-[#494551]">
                        <p className="text-sm">Belum ada data interaksi.</p>
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col">
                        {/* Chart */}
                        <div className="relative flex-1">
                            {/* Y-axis reference lines */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-3 pb-3 pt-4">
                                <span className="border-t border-dashed border-[#d7e5dc]/70 text-[10px] text-[#494551]" />
                                <span className="border-t border-dashed border-[#d7e5dc]/70 text-[10px] text-[#494551]" />
                                <span className="border-t border-dashed border-[#d7e5dc]/70 text-[10px] text-[#494551]" />
                            </div>

                            <div className="flex h-full min-h-40 items-end gap-2 rounded-lg bg-[#f7fbf8] px-3 pb-3 pt-4">
                                {data.map((item) => {
                                    const pct = (val: number) =>
                                        Math.max(2, (val / maxValue) * 100);

                                    const sorted = [
                                        {
                                            ...METRICS[0],
                                            value: item.bookmarks,
                                        },
                                        {
                                            ...METRICS[1],
                                            value: item.whatsappClicks,
                                        },
                                        {
                                            ...METRICS[2],
                                            value: item.routeClicks,
                                        },
                                        {
                                            ...METRICS[3],
                                            value: item.totalViews,
                                        },
                                    ];

                                    return (
                                        <div
                                            key={`${item.year}-${item.month}`}
                                            className="group relative flex flex-1 flex-col items-center gap-2"
                                            onMouseEnter={() =>
                                                setTooltip({
                                                    period: item.period,
                                                    bookmarks: item.bookmarks,
                                                    whatsappClicks:
                                                        item.whatsappClicks,
                                                    routeClicks:
                                                        item.routeClicks,
                                                    totalViews: item.totalViews,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setTooltip(null)
                                            }
                                        >
                                            <div className="flex h-28 w-full max-w-10 flex-col justify-end gap-px rounded-lg bg-white/80 p-1">
                                                {sorted.map((m) => (
                                                    <div
                                                        key={m.key}
                                                        className="w-full rounded-sm transition-all duration-200 hover:opacity-80"
                                                        style={{
                                                            height: `${pct(m.value)}%`,
                                                            backgroundColor:
                                                                m.color,
                                                        }}
                                                        title={`${m.label}: ${m.value.toLocaleString("id-ID")}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-center text-[11px] font-medium text-[#494551]">
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tooltip */}
                        {tooltip && (
                            <div className="mt-3 rounded-lg border border-[#dbe7df] bg-white p-3 shadow-sm">
                                <p className="mb-2 text-xs font-bold text-[#1d1b20]">
                                    {tooltip.period}
                                </p>
                                <div className="grid grid-cols-4 gap-3">
                                    {METRICS.map((m) => {
                                        const val = tooltip[m.key];
                                        return (
                                            <div key={m.key}>
                                                <p className="text-xs text-[#494551]">
                                                    {m.label}
                                                </p>
                                                <p
                                                    className="text-base font-bold"
                                                    style={{ color: m.color }}
                                                >
                                                    {val.toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
