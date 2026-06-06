import { Eye, TrendingUp, MapPin } from "lucide-react";
import { getViewTrends } from "@/lib/services/analytics-service";

interface ViewTrendAnalyticsProps {
    period?: "daily" | "weekly" | "monthly";
}

export default async function ViewTrendAnalytics({
    period = "daily",
}: ViewTrendAnalyticsProps) {
    const trends = await getViewTrends({ period, limit: 10 });

    if (trends.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <Eye className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                    Belum ada data kunjungan untuk periode ini.
                </p>
            </div>
        );
    }

    const maxViews = Math.max(...trends.map((t) => t.periodViews), 1);

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e1d4fd] text-[#4f378a]">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-heading text-lg font-bold text-gray-900">
                            Trending Destinasi
                        </h2>
                        <p className="text-sm text-gray-500">
                            Berdasarkan jumlah kunjungan{" "}
                            {period === "daily"
                                ? "hari ini"
                                : period === "weekly"
                                    ? "7 hari terakhir"
                                    : "30 hari terakhir"}
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f2ecf4] px-3 py-1 text-xs font-bold text-[#4f378a]">
                    <Eye className="h-3.5 w-3.5" />
                    Top Kunjungan
                </span>
            </div>

            <div className="divide-y divide-gray-50">
                {trends.map((item, index) => {
                    const barWidth = Math.max(
                        4,
                        (item.periodViews / maxViews) * 100,
                    );
                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 px-6 py-4 transition hover:bg-gray-50"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4f378a] text-sm font-bold text-white">
                                {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-gray-900">
                                    {item.name}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    {item.city} • {item.category}
                                </p>
                            </div>
                            <div className="hidden w-44 items-center gap-3 sm:flex">
                                <div className="h-2.5 flex-1 rounded-full bg-[#f2ecf4]">
                                    <div
                                        className="h-2.5 rounded-full bg-gradient-to-r from-[#4f378a] to-[#7c52c8] transition-all"
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-gray-900">
                                    {item.periodViews.toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs text-gray-500">
                                    dari {item.totalViews.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
