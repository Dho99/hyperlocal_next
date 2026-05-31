"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Search, Loader2, Building } from "lucide-react";
import type { Accommodation } from "@/types/accommodation";

function AccommodationCard({ item }: { item: Accommodation }) {
    const primaryImage =
        item.images && item.images.length > 0 ? item.images[0].imageUrl : null;
    const facilityNames = item.facilities?.map((f) => f.facility.name) ?? [];

    return (
        <Link
            href={`/penginapan/${item.id}`}
            className="group block rounded-xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className="relative h-48 bg-stone-100 overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Building className="h-10 w-10 text-stone-300" />
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
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useMemo(() => {
        fetch("/api/accommodations")
            .then((r) => r.json())
            .then((res) => {
                const all = res.data as Accommodation[];
                const approved = all.filter(
                    (a) => a.validationStatus === "APPROVED",
                );
                setAccommodations(approved);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return accommodations;
        const q = search.toLowerCase();
        return accommodations.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                (a.city?.toLowerCase().includes(q) ?? false) ||
                (a.province?.toLowerCase().includes(q) ?? false),
        );
    }, [accommodations, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
                <span className="text-sm">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* {JSON.stringify(accommodations)} */}
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

            {filtered.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-8">
                    {search
                        ? "Tidak ada penginapan yang sesuai"
                        : "Belum ada penginapan tersedia"}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((item) => (
                        <AccommodationCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
