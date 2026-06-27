import React from "react";
import { MoreHorizontal } from "lucide-react";

interface AnalyticsChartsProps {
    categories: {
        label: string;
        count: number;
        value: number;
    }[];
    facilities: {
        label: string;
        count: number;
        value: number;
    }[];
}

export default function AnalyticsCharts({
    categories,
    facilities,
}: AnalyticsChartsProps) {
    const categoryColors = [
        "bg-emerald-500",
        "bg-emerald-600",
        "bg-amber-500",
        "bg-blue-500",
        "bg-rose-500",
        "bg-indigo-500",
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card - Destinasi by Category */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-card-foreground">
                        Destinasi by Category
                    </h2>
                    <button className="text-gray-400 dark:text-card-foreground hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-6">
                    {categories.slice(0, 5).map((cat, idx) => (
                        <div key={cat.label} className="space-y-2">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-bold text-gray-700 dark:text-card-foreground">
                                    {cat.label}
                                </span>
                                <span className="text-gray-500 dark:text-card-foreground font-semibold">
                                    {cat.value}%{" "}
                                    <span className="text-gray-300 dark:text-card-foreground mx-1 font-normal">
                                        |
                                    </span>{" "}
                                    {cat.count}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${categoryColors[idx % categoryColors.length]} rounded-full`}
                                    style={{ width: `${cat.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Card - Halal Facilities Distribution */}
            <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-card-foreground">
                        Facilities Statistics
                    </h2>
                    <button className="text-gray-400 dark:text-card-foreground hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-6">
                    {facilities.slice(0, 5).map((fac, idx) => (
                        <div key={fac.label} className="space-y-2">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-bold text-gray-700 dark:text-card-foreground">
                                    {fac.label}
                                </span>
                                <span className="text-gray-500 dark:text-card-foreground font-semibold">
                                    {fac.value}%{" "}
                                    <span className="text-gray-300 dark:text-card-foreground mx-1 font-normal">
                                        |
                                    </span>{" "}
                                    {fac.count}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${categoryColors[(idx + 2) % categoryColors.length]} rounded-full`}
                                    style={{ width: `${fac.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {facilities.length === 0 && (
                        <div className="text-center py-8 text-gray-400 dark:text-card-foreground italic">
                            No facility data available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
