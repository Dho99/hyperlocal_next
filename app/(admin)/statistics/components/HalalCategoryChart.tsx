import React from "react";

interface HalalCategoryChartProps {
    data: { label: string; count: number; percent: number; color: string }[];
}

export default function HalalCategoryChart({ data }: HalalCategoryChartProps) {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-emerald-900 dark:text-card-foreground">
                        Distribusi Kesiapan Halal Destinasi
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-card-foreground mt-0.5">
                        {total} destinasi total
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700 dark:text-card-foreground">
                                {item.label}
                            </span>
                            <span className="text-gray-500 dark:text-card-foreground font-semibold tabular-nums">
                                {item.percent}%
                                <span className="text-gray-300 dark:text-card-foreground mx-1.5 font-normal">|</span>
                                {item.count} destinasi
                            </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                style={{ width: `${item.percent}%` }}
                            />
                        </div>
                    </div>
                ))}

                {total === 0 && (
                    <div className="text-center py-8 text-gray-400 italic text-sm">
                        Belum ada data destinasi.
                    </div>
                )}
            </div>
        </div>
    );
}
