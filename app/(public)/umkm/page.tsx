"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Store,
    MapPin,
    Star,
    BadgeCheck,
    Loader2,
    AlertCircle,
    Search,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/generated/prisma";
import type { Umkm } from "@/types/umkm";

function getHalalBadge(
    umkm: Umkm,
): { label: string; variant: "certified" | "friendly" } | null {
    const cert = umkm.certifications?.[0];
    if (!cert) return null;
    if (cert.status === "VALID")
        return { label: "Verified Halal", variant: "certified" };
    if (cert.status === "PENDING")
        return { label: "Muslim Friendly", variant: "friendly" };
    return null;
}

function getRatingDisplay(umkm: Umkm): number {
    return umkm.rating ?? umkm.reviewCount ?? 0;
}

interface CategoryApiResponse {
    data: Category[];
}

interface UmkmApiResponse {
    data: Umkm[];
}

function UmkmTabsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<Category[]>([]);
    const [umkms, setUmkms] = useState<Umkm[]>([]);

    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingUmkms, setIsLoadingUmkms] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Read initial active category and search from URL
    const activeCategory = searchParams.get("category") || "Semua";
    const activeSearch = searchParams.get("search") || "";

    const [keyword, setKeyword] = useState(activeSearch);

    // Debounce keyword change to update URL params
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (keyword) {
                params.set("search", keyword);
            } else {
                params.delete("search");
            }
            if (
                searchParams.get("search") !== (keyword || null) &&
                (searchParams.get("search") !== null || keyword !== "")
            ) {
                router.push(`/umkm?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [keyword, router, searchParams]);

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories?type=UMKM");
                if (!res.ok) throw new Error("Gagal memuat kategori");
                const json: CategoryApiResponse = await res.json();
                setCategories(json.data || []);
            } catch (err: unknown) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setIsLoadingCategories(false);
            }
        }
        fetchCategories();
    }, []);

    // Fetch UMKMs when activeCategory or activeSearch changes
    const fetchUmkms = useCallback(
        async (categorySlug: string, searchQuery: string) => {
            setIsLoadingUmkms(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.set("limit", "24");
                if (categorySlug && categorySlug !== "Semua") {
                    params.set("category", categorySlug);
                }
                if (searchQuery) {
                    params.set("search", searchQuery);
                }

                const res = await fetch(`/api/umkms?${params.toString()}`);
                if (!res.ok) throw new Error("Gagal memuat data UMKM");
                const json: UmkmApiResponse = await res.json();
                setUmkms(json.data || []);
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : "Terjadi kesalahan",
                );
            } finally {
                setIsLoadingUmkms(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchUmkms(activeCategory, activeSearch);
    }, [fetchUmkms, activeCategory, activeSearch]);

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "Semua") {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/umkm?${params.toString()}`);
    };

    return (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 bg-background">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Pelaku UMKM
                </h1>
                <p className="text-gray-500">
                    Temukan berbagai UMKM yang terverifikasi di ekosistem kami.
                </p>
            </div>

            <div className="mb-8 relative max-w-2xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari nama UMKM atau destinasi terdekat (misal: Pantai Karang Tawulan)..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
            </div>

            {isLoadingCategories ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-800" />
                </div>
            ) : (
                <Tabs
                    value={activeCategory}
                    onValueChange={handleTabChange}
                    className="w-full mb-8"
                >
                    <TabsList className="flex flex-wrap h-auto w-full justify-start bg-stone-100 p-1 rounded-xl">
                        <TabsTrigger
                            value="Semua"
                            className="rounded-lg px-4 py-2 text-stone-700 data-[state=active]:bg-emerald-800 data-[state=active]:text-white transition-all"
                        >
                            Semua
                        </TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.slug}
                                className="rounded-lg px-4 py-2 text-stone-700 data-[state=active]:bg-emerald-800 data-[state=active]:text-white transition-all"
                            >
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoadingUmkms && (
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

                {!isLoadingUmkms && !error && (
                    <>
                        {umkms.length === 0 ? (
                            <div className="col-span-full flex h-64 flex-col items-center justify-center text-center">
                                <Store className="mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-sm text-gray-500">
                                    Belum ada pelaku UMKM yang terdaftar di
                                    kategori ini.
                                </p>
                            </div>
                        ) : (
                            umkms.map((umkm) => {
                                const badge = getHalalBadge(umkm);
                                const cover = umkm.images?.[0]?.imageUrl;

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
                                                            ? "bg-white/90 text-emerald-800"
                                                            : "bg-amber-100/90 text-amber-800"
                                                    }`}
                                                >
                                                    <BadgeCheck size={14} />
                                                    {badge.label}
                                                </div>
                                            )}
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
                                                    umkm.destination?.city ||
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
    );
}

export default function UmkmPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                </div>
            }
        >
            <UmkmTabsContent />
        </Suspense>
    );
}
