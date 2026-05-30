"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, MapPin, Loader2, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface RecommendationResult {
    destinationId: string;
    reason: string;
    matchScore: number;
}

interface DestinationDetail {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    imageUrl: string | null;
    halalScore: number | null;
    rating: number | null;
}

function DesktopCategoryChip({
    label,
    selected,
    onToggle,
}: {
    label: string;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "rounded-full px-4 py-2 text-sm font-medium border transition-all",
                selected
                    ? "bg-[#4f378a] text-white border-[#4f378a] shadow-sm"
                    : "bg-white/70 text-[#494551] border-[#cbc4d2]/50 hover:border-[#4f378a] hover:text-[#4f378a]",
            )}
        >
            {label}
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-[#cbc4d2]/50 bg-white shadow-sm animate-pulse">
            <div className="aspect-[16/10] bg-[#f2ecf4]" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-[#f2ecf4]" />
                <div className="h-3 w-1/2 rounded bg-[#f2ecf4]" />
                <div className="h-14 w-full rounded bg-[#f2ecf4]" />
            </div>
        </div>
    );
}

function ResultCard({
    destination,
    reason,
    matchScore,
    isAiGenerated,
}: {
    destination: DestinationDetail;
    reason: string;
    matchScore: number;
    isAiGenerated: boolean;
}) {
    return (
        <Link
            href={`/destinasi/${destination.id}`}
            className="group overflow-hidden rounded-xl border border-[#cbc4d2]/50 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg block"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f2ecf4]">
                {destination.imageUrl ? (
                    <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <MapPin className="h-10 w-10 text-[#cbc4d2]" />
                    </div>
                )}
                <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                    <Star className="size-3.5 fill-[#e7c365] text-[#e7c365]" />
                    {matchScore}
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-heading text-base font-bold leading-tight text-[#1f1635] group-hover:text-[#4f378a] transition-colors">
                        {destination.name}
                    </h3>
                    {destination.city && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-[#494551]">
                            <MapPin className="size-3.5" />
                            {destination.city}
                        </p>
                    )}
                </div>
                {isAiGenerated ? (
                    <div className="rounded-lg bg-[#eaddff] p-3 text-xs leading-relaxed text-[#22005d]">
                        <div className="flex items-start gap-2">
                            <Sparkles className="size-3.5 mt-0.5 shrink-0 text-[#6750a4]" />
                            <span>{reason}</span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-[#f2ecf4] p-3 text-xs leading-relaxed text-[#494551]">
                        {reason}
                    </div>
                )}
            </div>
        </Link>
    );
}

export function AiRecommendations() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [limit, setLimit] = useState(5);
    const [results, setResults] = useState<RecommendationResult[]>([]);
    const [destinationDetails, setDestinationDetails] = useState<
        Map<string, DestinationDetail>
    >(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isAiGenerated, setIsAiGenerated] = useState(false);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                const json = await res.json();
                const list: Category[] =
                    json.data ??
                    json.categories ??
                    json.categoryList ??
                    json ??
                    [];
                setCategories(list);
            } catch {
                setCategories([]);
            }
        }
        fetchCategories();
    }, []);

    const toggleCategory = useCallback((id: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id],
        );
    }, []);

    async function fetchResults() {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const res = await fetch("/api/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preferences: selectedCategoryIds,
                    limit,
                }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(
                    errJson.error ?? "Gagal mendapatkan rekomendasi",
                );
            }

            const json = await res.json();
            const data: RecommendationResult[] = json.data ?? [];

            setResults(data);

            const ids = data.map((r) => r.destinationId);

            if (ids.length > 0) {
                const detailRes = await fetch(
                    `/api/destinations?limit=${ids.length}`,
                );
                const detailJson = await detailRes.json();
                const allDestinations: unknown[] =
                    detailJson.data ?? detailJson.destinations ?? [];

                const map = new Map<string, DestinationDetail>();
                for (const d of allDestinations) {
                    const dest = d as {
                        id: string;
                        name: string;
                        slug: string;
                        city?: string | null;
                        images?: Array<{ imageUrl: string }>;
                        halalScore?: number | null;
                        rating?: number | null;
                    };
                    map.set(dest.id, {
                        id: dest.id,
                        name: dest.name,
                        slug: dest.slug,
                        city: dest.city ?? null,
                        imageUrl:
                            dest.images && dest.images.length > 0
                                ? dest.images[0].imageUrl
                                : null,
                        halalScore: dest.halalScore ?? null,
                        rating: dest.rating ?? null,
                    });
                }
                setDestinationDetails(map);
            }

            const hasAiReason = data.some(
                (r) => r.reason !== "Destinasi dengan skor halal tertinggi",
            );
            setIsAiGenerated(hasAiReason);
        } catch (err: unknown) {
            const message = getApiErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    const displayedResults = results.slice(0, limit);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                {categories.length === 0 ? (
                    <p className="text-sm text-[#494551]">
                        Memuat kategori...
                    </p>
                ) : (
                    categories.map((cat) => (
                        <DesktopCategoryChip
                            key={cat.id}
                            label={cat.name}
                            selected={selectedCategoryIds.includes(cat.id)}
                            onToggle={() => toggleCategory(cat.id)}
                        />
                    ))
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="result-limit"
                        className="text-sm text-[#494551]"
                    >
                        Jumlah:
                    </label>
                    <select
                        id="result-limit"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="rounded-lg border border-[#cbc4d2]/50 bg-white/70 px-3 py-1.5 text-sm text-[#1f1635] focus:outline-none focus:ring-2 focus:ring-[#4f378a]/30"
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={fetchResults}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#4f378a] px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d2870] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && (
                        <Loader2 className="size-4 animate-spin" />
                    )}
                    Temukan Rekomendasi
                </button>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm text-[#6750a4] animate-pulse">
                        <Sparkles className="size-4" />
                        AI sedang menyusun rekomendasi terbaik untukmu...
                    </p>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: limit }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="size-5 shrink-0" />
                    {error}
                </div>
            )}

            {!isLoading && hasSearched && displayedResults.length === 0 && !error && (
                <p className="text-center text-sm text-[#494551] py-8">
                    Belum ada rekomendasi yang tersedia.
                </p>
            )}

            {!isLoading && displayedResults.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {displayedResults.map((r) => {
                        const dest = destinationDetails.get(r.destinationId);
                        if (!dest) return null;
                        return (
                            <ResultCard
                                key={r.destinationId}
                                destination={dest}
                                reason={r.reason}
                                matchScore={r.matchScore}
                                isAiGenerated={isAiGenerated}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
