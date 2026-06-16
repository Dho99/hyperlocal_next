"use client";

import { useState, useMemo, useDeferredValue } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Search, Loader2, Building, AlertCircle, BadgeCheck } from "lucide-react";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import type { Accommodation } from "@/types/accommodation";
import { HalalBadge } from "@/components/ui/halal-badge";

function AccommodationCard({ item }: { item: Accommodation }) {
    const primaryImage =
        item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
    const facilityNames = item.facilities?.map((f) => f.facility.name) ?? [];

    return (
        <Link
            href={`/penginapan/${item.id}`}
            className="group relative block rounded-xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <HalalBadge score={item.validatedScore} />
            <div className="relative h-48 bg-stone-100 rounded-t-xl overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center rounded-t-xl overflow-hidden">
                        <Building className="h-10 w-10 text-stone-300" />
                    </div>
                )}
                {item.validationStatus === "APPROVED" && (
                    <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-600/90 text-white backdrop-blur-sm shadow-sm">
                            <BadgeCheck size={11} />
                            Tervalidasi Halal
                        </span>
                    </div>
                )}
                {item.rating != null && item.rating > 0 && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-stone-900 shadow-sm backdrop-blur-md">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {item.rating.toFixed(1)}
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-heading font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {item.name}
                </h3>
                {item.city && (
                    <p className="flex items-center gap-1.5 text-sm text-stone-600">
                        <MapPin className="size-3.5 shrink-0" />
                        {item.city}
                        {item.province ? `, ${item.province}` : ""}
                    </p>
                )}
                {facilityNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {facilityNames.slice(0, 4).map((name) => (
                            <span
                                key={name}
                                className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
                            >
                                {name}
                            </span>
                        ))}
                        {facilityNames.length > 4 && (
                            <span className="text-xs text-stone-500">
                                +{facilityNames.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}

export function PublicAccommodationList() {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);

    const params = useMemo(() => {
        const p: Record<string, string> = {};
        if (deferredSearch.trim()) p.search = deferredSearch.trim();
        return p;
    }, [deferredSearch]);

    const { data, isLoading, error, hasMore, loadMore } =
        useCursorPagination<Accommodation>({
            url: "/api/accommodations",
            limit: 12,
            params,
        });

    return (
        <div className="space-y-8">
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                <input
                    type="text"
                    placeholder="Cari penginapan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
                />
            </div>

            {error && (
                <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
                    <AlertCircle className="size-5" />
                    <span className="text-sm">{error.message}</span>
                </div>
            )}

            <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoading}
                next={loadMore}
                loadingComponent={
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
                    </div>
                }
                endComponent={
                    data.length > 0 ? (
                        <p className="text-center text-sm text-stone-500 py-8">
                            Semua penginapan telah dimuat
                        </p>
                    ) : !isLoading ? (
                        <p className="text-center text-sm text-stone-500 py-8">
                            {search
                                ? "Tidak ada penginapan yang sesuai"
                                : "Belum ada penginapan tersedia"}
                        </p>
                    ) : null
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => (
                        <AccommodationCard key={item.id} item={item} />
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
}
