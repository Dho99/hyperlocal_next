"use client";

import { useMemo } from "react";

interface UmkmStatus {
    verified: number;
    inProgress: number;
    unverified: number;
    verifiedPercent: number;
}

interface HalalCategoryChartProps {
    data: {
        label?: string;
        count?: number;
        percent?: number;
        color?: string;
        dashArray?: number;
        dashOffset?: number;
    }[];
    umkmStatus: UmkmStatus;
}

const COLOR_MAP: Record<string, string> = {
    "bg-emerald-500": "#10B981",
    "bg-blue-500": "#3B82F6",
    "bg-amber-500": "#F59E0B",
    "bg-red-500": "#EF4444",
    "bg-gray-400": "#9CA3AF",
};

const CIRCUMFERENCE = 2 * Math.PI * 40; // ≈ 251.327

export default function HalalCategoryChart({
    data,
    umkmStatus,
}: HalalCategoryChartProps) {
    const total = data.reduce((sum, d) => sum + (d.count as number), 0);
    const umkmTotal =
        umkmStatus.verified + umkmStatus.inProgress + umkmStatus.unverified;

    const segments = useMemo(() => {
        return data.reduce<{ items: typeof data; cumulative: number }>(
            (acc, item) => {
                const dashArray =
                    total > 0
                        ? ((item.count as number) / total) * CIRCUMFERENCE
                        : 0;
                const dashOffset = -acc.cumulative;
                return {
                    items: [...acc.items, { ...item, dashArray, dashOffset }],
                    cumulative: acc.cumulative + dashArray,
                };
            },
            { items: [], cumulative: 0 },
        ).items;
    }, [data, total]);

    const umkmVerifiedDash =
        umkmTotal > 0 ? (umkmStatus.verified / umkmTotal) * CIRCUMFERENCE : 0;
    const umkmInProgressDash =
        umkmTotal > 0 ? (umkmStatus.inProgress / umkmTotal) * CIRCUMFERENCE : 0;
    const umkmInProgressOffset =
        umkmTotal > 0 ? -(umkmStatus.verified / umkmTotal) * CIRCUMFERENCE : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Halal Score Distribution */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-card-foreground">
                        Distribusi Skor Halal Destinasi
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-card-foreground mt-0.5">
                        {total} destinasi terdaftar
                    </p>
                </div>
                {total === 0 ? (
                    <div className="text-center py-8 text-gray-400 italic text-sm">
                        Belum ada data destinasi.
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <svg
                                viewBox="0 0 100 100"
                                className="w-full h-full -rotate-90"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#F3F4F6"
                                    strokeWidth="12"
                                />
                                {segments.map((seg, i) => (
                                    <circle
                                        key={i}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke={
                                            COLOR_MAP[seg.color as string] ??
                                            "#9CA3AF"
                                        }
                                        strokeWidth="12"
                                        strokeDasharray={`${seg.dashArray} ${CIRCUMFERENCE}`}
                                        strokeDashoffset={seg.dashOffset}
                                    />
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-xl font-extrabold text-gray-900 dark:text-card-foreground">
                                    {total}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-card-foreground font-semibold">
                                    Destinasi
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-3">
                            {data.map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        COLOR_MAP[
                                                            item.color as string
                                                        ] ?? "#9CA3AF",
                                                }}
                                            />
                                            <span className="font-medium text-gray-700 dark:text-card-foreground">
                                                {item.label}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 dark:text-card-foreground font-semibold tabular-nums">
                                            {item.percent}%
                                            <span className="text-gray-300 mx-1 font-normal">
                                                |
                                            </span>
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                            style={{
                                                width: `${item.percent}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Card B: UMKM Halal Status */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-card-foreground">
                        Status Halal UMKM
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-card-foreground mt-0.5">
                        {umkmTotal} UMKM terdaftar
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-1/2 h-36 flex-shrink-0">
                        <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full -rotate-90"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#F3F4F6"
                                strokeWidth="12"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#F59E0B"
                                strokeWidth="12"
                                strokeDasharray={`${umkmInProgressDash} ${CIRCUMFERENCE}`}
                                strokeDashoffset={umkmInProgressOffset}
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#7C3AED"
                                strokeWidth="12"
                                strokeDasharray={`${umkmVerifiedDash} ${CIRCUMFERENCE}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-extrabold text-gray-900 dark:text-card-foreground">
                                {umkmStatus.verifiedPercent}%
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-card-foreground font-semibold">
                                Verified
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-1/2">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                                <span className="text-xs font-bold text-gray-500 dark:text-card-foreground uppercase">
                                    Verified
                                </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-card-foreground">
                                {umkmStatus.verified.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                certified businesses
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-xs font-bold text-gray-500 dark:text-card-foreground uppercase">
                                    In Progress
                                </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-card-foreground">
                                {umkmStatus.inProgress.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                validation pending
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                                <span className="text-xs font-bold text-gray-500 dark:text-card-foreground uppercase">
                                    Unverified
                                </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-card-foreground">
                                {umkmStatus.unverified.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                no certificates
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
