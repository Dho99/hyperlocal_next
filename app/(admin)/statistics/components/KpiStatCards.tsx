import React from "react";
import { Flag, Store, BadgeCheck, Award, TrendingUp } from "lucide-react";

interface KpiStatsProps {
    stats: {
        totalDestinations: number;
        totalUmkms: number;
        verifiedUmkms: number;
        avgHalalScore: number;
    };
}

const CIRCUMFERENCE = 2 * Math.PI * 40;

export default function KpiStatCards({ stats }: KpiStatsProps) {
    const verificationRate =
        stats.totalUmkms > 0
            ? Math.round((stats.verifiedUmkms / stats.totalUmkms) * 100)
            : 0;

    const scoreDash = (stats.avgHalalScore / 100) * CIRCUMFERENCE;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {/* Card 1 — Total Destinations */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Flag className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-500 dark:text-card-foreground text-sm font-semibold">
                            Total Destinations
                        </h3>
                        <div className="text-3xl font-bold text-gray-500 dark:text-card-foreground tracking-tight mt-0.5">
                            {stats.totalDestinations.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                            registered in system
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                        <TrendingUp className="w-3 h-3" />
                        Active
                    </div>
                </div>
            </div>

            {/* Card 2 — Total UMKM */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-500 dark:text-card-foreground text-sm font-semibold">
                            Total UMKM
                        </h3>
                        <div className="text-3xl font-bold text-gray-500 dark:text-card-foreground tracking-tight mt-0.5">
                            {stats.totalUmkms.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                            partners across regions
                        </p>
                    </div>
                </div>
            </div>

            {/* Card 3 — Verified UMKM */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-500 dark:text-card-foreground text-sm font-semibold">
                            Verified UMKM
                        </h3>
                        <div className="text-3xl font-bold text-gray-500 dark:text-card-foreground tracking-tight mt-0.5">
                            {stats.verifiedUmkms.toLocaleString()}
                        </div>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                            {verificationRate}% verification rate
                        </p>
                    </div>
                </div>
            </div>

            {/* Card 4 — Avg Halal Score (mini donut right of number) */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-gray-500 dark:text-card-foreground text-sm font-semibold mb-1">
                            Avg Halal Score
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-2xl font-bold text-gray-900 dark:text-card-foreground tracking-tight">
                                    {stats.avgHalalScore}
                                    <span className="text-sm text-gray-400 font-medium">
                                        /100
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                    rata-rata skor
                                </p>
                            </div>
                            <div className="relative w-14 h-14 shrink-0">
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
                                        strokeWidth="14"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#059669"
                                        strokeWidth="14"
                                        strokeLinecap="round"
                                        strokeDasharray={`${scoreDash} ${CIRCUMFERENCE}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-gray-900 dark:text-card-foreground leading-none">
                                        {stats.avgHalalScore}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
