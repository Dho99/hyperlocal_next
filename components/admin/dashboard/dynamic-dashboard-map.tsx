"use client";

import dynamic from "next/dynamic";
import type { DashboardMapDestination } from "@/types/map-viewer";

const DashboardMap = dynamic(() => import("./dashboard-map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Memuat Peta...</p>
        </div>
    ),
});

interface DynamicDashboardMapProps {
    destinations: DashboardMapDestination[];
}

export function DynamicDashboardMap({
    destinations,
}: DynamicDashboardMapProps) {
    return <DashboardMap destinations={destinations} />;
}
