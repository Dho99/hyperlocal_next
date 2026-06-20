"use client";

import dynamic from "next/dynamic";

const PetaMapClient = dynamic(() => import("./peta-map-client"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">Memuat peta...</p>
        </div>
    ),
});

export default function PetaMapDynamic() {
    return <PetaMapClient />;
}
