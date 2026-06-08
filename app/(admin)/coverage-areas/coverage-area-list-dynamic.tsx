"use client";

import dynamic from "next/dynamic";

const CoverageAreaList = dynamic(
    () => import("./coverage-area-list").then((mod) => mod.CoverageAreaList),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center py-20">
                <p className="text-sm text-stone-500">Memuat...</p>
            </div>
        ),
    },
);

export default function CoverageAreaListDynamic() {
    return <CoverageAreaList />;
}
