"use client";

import dynamic from "next/dynamic";
import type { MapDestination } from "@/types/map-viewer";

const ContextMap = dynamic(() => import("./destination-context-map-client"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-lg overflow-hidden bg-muted animate-pulse flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Memuat Peta...</p>
        </div>
    ),
});

interface DynamicContextMapProps {
    destination: MapDestination;
    className?: string;
}

export function DynamicContextMap({
    destination,
    className,
}: DynamicContextMapProps) {
    return <ContextMap destination={destination} className={className} />;
}
