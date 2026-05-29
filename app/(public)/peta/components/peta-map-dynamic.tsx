"use client";

import dynamic from "next/dynamic";

const PetaMapClient = dynamic(() => import("./peta-map-client"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-[#f2ecf4]">
            <p className="text-sm text-[#7a7380]">Memuat peta...</p>
        </div>
    ),
});

export default function PetaMapDynamic() {
    return <PetaMapClient />;
}
