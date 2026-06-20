"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Sparkles,
    MapPin,
    Loader2,
    AlertCircle,
    Star,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
    rating: number | null;
    imageUrl: string | null;
    categoryName: string | null;
    facilityNames: string[];
}

interface ExploreResponseItem {
    destination: ExploreDestination;
    matchScore: number;
    aiReason: string;
}

interface ExploreResponse {
    query: string;
    data: ExploreResponseItem[];
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
    return (
        <Link
            href={`/destinasi/${destination.slug}`}
            className="group relative rounded-xl border border-border/50 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg block"
        >
            <HalalBadge score={destination.halalScore} />
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
                            {destination.halalScore ?? "—"}
                        </span>
                    </div>
                </div>

                {destination.facilityNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {destination.facilityNames.slice(0, 3).map((name) => (
                            <span
                                key={name}
                                className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                            >
                                {name}
                            </span>
                        ))}
                        {destination.facilityNames.length > 3 && (
                            <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                +{destination.facilityNames.length - 3}
                            </span>
                        )}
                    </div>
                )}

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
    }, []);

    useEffect(() => {
        fetchResults(query);
    }, [query, fetchResults]);

    const hasAiReason =
        results?.data?.some(
            (r) => r.aiReason !== "Destinasi dengan skor halal tertinggi",
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
                <EmptyState query={query} />
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
