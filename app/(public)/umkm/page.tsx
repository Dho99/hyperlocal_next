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
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Pelaku UMKM
                </h1>
                <p className="text-muted-foreground">
                    Temukan berbagai UMKM yang terverifikasi di ekosistem kami.
                </p>
            </div>

            <div className="mb-8 relative max-w-2xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari nama UMKM atau destinasi terdekat (misal: Pantai Karang Tawulan)..."
                    className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/20"
                />
            </div>

            {isLoadingCategories ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
            ) : (
                <Tabs
                    value={activeCategory}
                    onValueChange={handleTabChange}
                    className="w-full mb-8"
                >
                    <TabsList className="flex flex-wrap h-auto w-full justify-start bg-muted p-1 rounded-xl">
                        <TabsTrigger
                            value="Semua"
                            className="rounded-lg px-4 py-2 text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-white transition-all"
                        >
                            Semua
                        </TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.slug}
                                className="rounded-lg px-4 py-2 text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-white transition-all"
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
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                )}

                {error && (
                    <div className="col-span-full flex h-64 flex-col items-center justify-center text-center">
                        <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {!isLoadingUmkms && !error && (
                    <>
                        {umkms.length === 0 ? (
                            <div className="col-span-full flex h-64 flex-col items-center justify-center text-center">
                                <Store className="mb-4 h-12 w-12 text-muted-foreground/60" />
                                <p className="text-sm text-muted-foreground">
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
                                        className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
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
                                                <div className="flex h-full items-center justify-center bg-muted">
                                                    <Store className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                            )}
                                            {badge && (
                                                <div
                                                    className={`absolute left-3 top-3 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold backdrop-blur-sm ${
                                                        badge.variant ===
                                                        "certified"
                                                            ? "bg-accent/90 text-white"
                                                            : "bg-amber-500/20 text-amber-400"
                                                    }`}
                                                >
                                                    <BadgeCheck size={14} />
                                                    {badge.label}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="mb-2 flex items-start justify-between">
                                                <h2 className="line-clamp-1 text-base font-semibold text-foreground">
                                                    {umkm.name}
                                                </h2>
                                                <div className="flex shrink-0 items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-sm text-amber-400">
                                                    <Star
                                                        size={14}
                                                        className="fill-current"
                                                    />
                                                    {getRatingDisplay(
                                                        umkm,
                                                    ).toFixed(1)}
                                                </div>
                                            </div>
                                            <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin size={16} />
                                                {umkm.address ||
                                                    umkm.destination?.city ||
                                                    "Lokasi UMKM"}
                                            </p>
                                            <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                                                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
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
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
            }
        >
            <UmkmTabsContent />
        </Suspense>
    );
}
