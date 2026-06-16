"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    List,
    Map,
    BadgeCheck,
    Heart,
    Star,
    MapPin,
    Store,
    Loader2,
    AlertCircle,
} from "lucide-react";
import type { Umkm } from "@/types/umkm";

interface UmkmListProps {
    initialSearch?: string;
    initialCategory?: string;
}

interface ApiResponse {
    data: Umkm[];
    nextCursor?: string | null;
    hasMore?: boolean;
}

const categoryFilters = ["Restoran", "Street Food", "Kafe"];

const halalGradeFilters = [
    { label: "Halal Certified", key: "certified" },
    { label: "Muslim Friendly", key: "friendly" },
    { label: "Pork-Free", key: "pork-free" },
];

const ratingFilters = [
    { value: 5, label: "5 Bintang" },
    { value: 4, label: "4+ Bintang" },
];

function getHalalBadge(
    umkm: Umkm,
): { label: string; variant: "certified" | "friendly" } | null {
    const cert = umkm.certifications?.[0];
    if (cert?.status === "VALID")
        return { label: "Bersertifikat Halal", variant: "certified" };
    if (umkm.validationStatus === "APPROVED")
        return { label: "Tervalidasi Halal", variant: "certified" };
    if (cert?.status === "PENDING")
        return { label: "Muslim Friendly", variant: "friendly" };
    return null;
}

function getRatingDisplay(umkm: Umkm): number {
    return umkm.rating ?? umkm.reviewCount ?? 0;
}

export function UmkmList({ initialSearch, initialCategory }: UmkmListProps) {
    const [umkms, setUmkms] = useState<Umkm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch || "");
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory ? [initialCategory] : [],
    );
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [favorited, setFavorited] = useState<Set<string>>(new Set());

    const fetchUmkms = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("limit", "24");
            if (searchQuery) params.set("search", searchQuery);

            const res = await fetch(`/api/umkms?${params.toString()}`);
            if (!res.ok) throw new Error("Gagal memuat data");
            const json: ApiResponse = await res.json();
            setUmkms(json.data || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchUmkms();
    }, [fetchUmkms]);

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
        );
    };

    const toggleFavorite = (id: string) => {
        setFavorited((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hasil Pencarian
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Menampilkan {umkms.length} hasil
                        {searchQuery && ` untuk "${searchQuery}"`}
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                            viewMode === "list"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-500 hover:text-emerald-800 hover:bg-gray-200"
                        }`}
                    >
                        <List size={16} />
                        List
                    </button>
                    <button
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition ${
                            viewMode === "map"
                                ? "bg-white text-emerald-800 shadow-sm"
                                : "text-gray-500 hover:text-emerald-800 hover:bg-gray-200"
                        }`}
                    >
                        <Map size={16} />
                        Peta
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                <aside className="w-full shrink-0 lg:w-64">
                    <div className="sticky top-28 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Filter
                            </h3>
                            <button
                                onClick={() => {
                                    setSelectedCategories([]);
                                    setSelectedRating(null);
                                    setSearchQuery("");
                                }}
                                className="text-sm text-emerald-800 hover:underline"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="mb-6 border-t border-gray-100 pt-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                KATEGORI
                            </h4>
                            <div className="space-y-2">
                                {categoryFilters.map((cat) => (
                                    <label
                                        key={cat}
                                        className="flex cursor-pointer items-center gap-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(
                                                cat,
                                            )}
                                            onChange={() => toggleCategory(cat)}
                                            className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-emerald-800 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-900">
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6 border-t border-gray-100 pt-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                HALAL GRADE
                            </h4>
                            <div className="space-y-2">
                                {halalGradeFilters.map((filter) => (
                                    <label
                                        key={filter.key}
                                        className="flex cursor-pointer items-center gap-3"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-emerald-800 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-900">
                                            {filter.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6 border-t border-gray-100 pt-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                RATING
                            </h4>
                            <div className="space-y-2">
                                {ratingFilters.map((filter) => (
                                    <label
                                        key={filter.value}
                                        className="flex cursor-pointer items-center gap-3"
                                    >
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={
                                                selectedRating === filter.value
                                            }
                                            onChange={() =>
                                                setSelectedRating(filter.value)
                                            }
                                            className="h-4 w-4 border-gray-300 bg-gray-50 text-emerald-800 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center text-amber-600">
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={
                                                            i < filter.value
                                                                ? "fill-current text-amber-500"
                                                                : "text-gray-300"
                                                        }
                                                    />
                                                ),
                                            )}
                                            <span className="ml-1 text-sm text-gray-900">
                                                {filter.label}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button className="w-full rounded-lg bg-emerald-800 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                            Terapkan Filter
                        </button>
                    </div>
                </aside>

                <div className="flex-1 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading && (
                        <div className="col-span-full flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                        </div>
                    )}

                    {error && (
                        <div className="col-span-full flex h-64 flex-col items-center justify-center text-center">
                            <AlertCircle className="mb-4 h-10 w-10 text-red-500" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            {umkms.length === 0 ? (
                                <div className="col-span-full flex h-64 flex-col items-center justify-center text-center">
                                    <Store className="mb-4 h-12 w-12 text-gray-300" />
                                    <p className="text-sm text-gray-500">
                                        Tidak ada UMKM ditemukan
                                    </p>
                                </div>
                            ) : (
                                umkms.map((umkm) => {
                                    const badge = getHalalBadge(umkm);
                                    const cover = umkm.images?.[0]?.imageUrl;
                                    const isFav = favorited.has(umkm.id);

                                    return (
                                        <Link
                                            key={umkm.id}
                                            href={`/umkm/${umkm.slug}`}
                                            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                {cover ? (
                                                    <Image
                                                        src={cover}
                                                        alt={umkm.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gray-100">
                                                        <Store className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                                {badge && (
                                                    <div
                                                        className={`absolute left-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold backdrop-blur-sm ${
                                                            badge.variant ===
                                                            "certified"
                                                                ? "bg-green-600/90 text-white"
                                                                : "bg-amber-100/90 text-amber-800"
                                                        }`}
                                                    >
                                                        <BadgeCheck
                                                            size={14}
                                                        />
                                                        {badge.label}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleFavorite(umkm.id);
                                                    }}
                                                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-gray-700 backdrop-blur-sm transition-colors hover:text-red-500"
                                                >
                                                    <Heart
                                                        size={16}
                                                        className={
                                                            isFav
                                                                ? "fill-current text-red-500"
                                                                : ""
                                                        }
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex flex-1 flex-col p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <h2 className="line-clamp-1 text-base font-semibold text-gray-900">
                                                        {umkm.name}
                                                    </h2>
                                                    <div className="flex shrink-0 items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-sm text-amber-700">
                                                        <Star
                                                            size={14}
                                                            className="fill-current"
                                                        />
                                                        {getRatingDisplay(
                                                            umkm,
                                                        ).toFixed(1)}
                                                    </div>
                                                </div>
                                                <p className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                                                    <MapPin size={16} />
                                                    {umkm.address ||
                                                        umkm.destination
                                                            ?.city ||
                                                        "Lokasi UMKM"}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                        {umkm.category?.name ||
                                                            "UMKM"}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
