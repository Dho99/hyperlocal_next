"use client";

import React from "react";
import { Calendar, MapPin, Download } from "lucide-react";
import { DetailedStatistics } from "@/lib/services/analytics-service";

export default function StatisticsHeader({
    data,
}: {
    data: DetailedStatistics;
}) {
    const handleExport = () => {
        const csvContent = [
            ["Metric", "Value"],
            ["Total Destinations", data.kpi.totalDestinations],
            ["Total UMKM", data.kpi.totalUmkms],
            ["Total Facilities", data.kpi.totalFacilities],
            ["Verified UMKM", data.kpi.verifiedUmkms],
            ["Average Halal Score", data.kpi.avgHalalScore],
            [""],
            ["Top Destinations", "Score", "Category"],
            ...data.rankings.topDestinations.map((d) => [
                d.name,
                d.score,
                d.category,
            ]),
            [""],
            ["Top UMKM", "Rating", "Category"],
            ...data.rankings.topUmkms.map((u) => [
                u.name,
                u.rating,
                u.category,
            ]),
        ]
            .map((e) => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `halal_tourism_statistics_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <header className="flex xl:flex-row flex-col justify-between gap-4 mb-8">
            <div className="w-full lg:w-auto">
                <h1 className="text-3xl font-bold tracking-tight font-heading">
                    Statistik & Analitik Overview
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Comprehensive insights into Halal Tourism ecosystem
                    performance.
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors dark:bg-card dark:text-card-foreground">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-card-foreground" />
                    Last 30 Days
                </button>
                <button className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors dark:bg-card dark:text-card-foreground">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-card-foreground" />
                    All Regions
                </button>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                    <Download className="w-4 h-4 shrink-0" />
                    Export CSV
                </button>
            </div>
        </header>
    );
}
