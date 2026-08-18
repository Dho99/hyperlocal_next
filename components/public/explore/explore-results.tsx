"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Sparkles,
    MapPin,
    AlertCircle,
    Star,
    Search,
    Building2,
    Store,
    Route,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-error";
import { EmptyState } from "./empty-state";
import { HalalBadge } from "@/components/ui/halal-badge";

interface ExploreDestination {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    halalScore: number | null;
    aceshScore: number | null;
    aceshClassification: string | null;
    aceshVerificationStatus: "PENDING" | "VERIFIED" | null;
    rating: number | null;
    imageUrl: string | null;
    categoryName: string | null;
    facilities: Array<{
        id: string;
        name: string;
        distanceKm: number | null;
    }>;
    nearbyUmkms: Array<{
        id: string;
        name: string;
        slug: string;
        categoryName: string | null;
        distanceKm: number | null;
    }>;
}

interface ExploreResponseItem {
    destination: ExploreDestination;
    matchScore: number;
    aiReason: string;
}

interface ExploreResponse {
    query: string;
    data: ExploreResponseItem[];
    fallbackSuggestion?: string;
}

function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm animate-pulse">
            <div className="aspect-[16/10] bg-primary" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted" />
                    <div className="h-5 w-20 rounded-full bg-muted" />
                </div>
                <div className="h-14 w-full rounded bg-muted" />
            </div>
        </div>
    );
}

interface ResultCardProps {
    destination: ExploreDestination;
    matchScore: number;
    aiReason: string;
    isAiGenerated: boolean;
}

function ResultCard({
    destination,
    matchScore,
    aiReason,
    isAiGenerated,
}: ResultCardProps) {
    const formatDistance = (distanceKm: number | null) => {
        if (distanceKm == null) return "jarak belum tersedia";
        return distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : `${distanceKm.toFixed(1)} km`;
    };

    return (
        <Link
            href={`/destinasi/${destination.slug}`}
            className="group relative rounded-xl border border-border/50 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg block"
        >
            <HalalBadge
                score={destination.aceshScore ?? destination.halalScore}
            />
            <div className="relative aspect-[16/10] rounded-t-xl overflow-hidden bg-muted">
                {destination.imageUrl ? (
                    <Image
                        src={destination.imageUrl}
                        alt={destination.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center rounded-t-xl overflow-hidden">
                        <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-heading text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {destination.name}
                        </h3>
                        {(destination.city || destination.province) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" />
                                {destination.city}
                                {destination.city && destination.province
                                    ? ", "
                                    : ""}
                                {destination.province}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-accent/20 px-2.5 py-1 shrink-0">
                        <Star className="size-3 fill-accent text-accent" />
                        <span className="text-xs font-bold text-accent-foreground">
                            {destination.aceshScore ??
                                destination.halalScore ??
                                "—"}
                        </span>
                    </div>
                </div>

                <p className="text-[11px] font-medium text-primary">
                    Kecocokan rekomendasi {Math.round(matchScore)}%
                </p>

                {destination.aceshScore != null &&
                    destination.aceshVerificationStatus === "PENDING" && (
                        <p className="text-[11px] text-muted-foreground">
                            Skor sementara — data belum sepenuhnya tervalidasi.
                        </p>
                    )}

                <div className="space-y-3 border-t border-border/60 pt-3">
                    <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Building2 className="size-3.5 text-primary" />
                            Fasilitas sekitar
                        </p>
                        {destination.facilities.length > 0 ? (
                            <ul className="space-y-1">
                                {destination.facilities.slice(0, 3).map((facility) => (
                                    <li key={facility.id} className="flex items-start justify-between gap-2 text-[11px] text-muted-foreground">
                                        <span className="line-clamp-1">{facility.name}</span>
                                        <span className="flex shrink-0 items-center gap-1 font-medium text-foreground/80">
                                            <Route className="size-3" />
                                            {formatDistance(facility.distanceKm)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[11px] text-muted-foreground">Belum ada fasilitas terdata.</p>
                        )}
                    </div>

                    <div>
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Store className="size-3.5 text-primary" />
                            UMKM sekitar
                        </p>
                        {destination.nearbyUmkms.length > 0 ? (
                            <ul className="space-y-1">
                                {destination.nearbyUmkms.slice(0, 3).map((umkm) => (
                                    <li key={umkm.id} className="flex items-start justify-between gap-2 text-[11px] text-muted-foreground">
                                        <span className="line-clamp-1">
                                            {umkm.name}
                                            {umkm.categoryName ? ` · ${umkm.categoryName}` : ""}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-1 font-medium text-foreground/80">
                                            <Route className="size-3" />
                                            {formatDistance(umkm.distanceKm)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[11px] text-muted-foreground">Belum ada UMKM terdata.</p>
                        )}
                    </div>
                </div>

                {isAiGenerated ? (
                    <div className="rounded-lg bg-accent/20 p-3 text-xs leading-relaxed text-accent-foreground ring-1 ring-accent/20">
                        <div className="flex items-start gap-2">
                            <Sparkles className="size-3.5 mt-0.5 shrink-0 text-accent" />
                            <span>{aiReason}</span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                        {aiReason}
                    </div>
                )}
            </div>
        </Link>
    );
}

interface ExploreResultsProps {
    query: string;
    lat?: string;
    lng?: string;
}

export function ExploreResults({ query, lat, lng }: ExploreResultsProps) {
    const [results, setResults] = useState<ExploreResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let url = `/api/explore?q=${encodeURIComponent(q)}`;
            if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
            const res = await fetch(url);

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.error ?? "Gagal mendapatkan hasil");
            }

            const json = (await res.json()) as ExploreResponse;
            setResults(json);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, [lat, lng]);

    useEffect(() => {
        // Data eksternal perlu dimuat ulang ketika parameter URL berubah.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchResults(query);
    }, [query, fetchResults]);

    const hasAiReason =
        results?.data?.some(
            (r) => r.aiReason !== "Destinasi dengan skor ACES-H tertinggi",
        ) ?? false;

    if (!query.trim()) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="size-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-heading font-semibold text-foreground">
                    Cari Destinasi Halal
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Gunakan kolom pencarian di halaman utama untuk menemukan
                    destinasi wisata halal yang sesuai dengan keinginan Anda.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-heading font-bold text-foreground sm:text-3xl">
                    Hasil rekomendasi AI untuk:
                </h1>
                <p className="mt-1 text-lg text-primary font-medium italic">
                    &ldquo;{query}&rdquo;
                </p>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    <p className="flex items-center gap-2 text-sm text-primary animate-pulse">
                        <Sparkles className="size-4" />
                        AI sedang menganalisis pencarianmu...
                    </p>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="size-5 shrink-0" />
                    {error}
                </div>
            )}

            {!isLoading && results && results.data.length === 0 && !error && (
                <EmptyState query={query} fallbackSuggestion={results.fallbackSuggestion} />
            )}

            {!isLoading && results && results.data.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {results.data.map((item) => (
                        <ResultCard
                            key={item.destination.id}
                            destination={item.destination}
                            matchScore={item.matchScore}
                            aiReason={item.aiReason}
                            isAiGenerated={hasAiReason}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
