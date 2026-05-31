"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    AlertCircle,
    ArrowDownUp,
    Loader2,
    MapPin,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from "lucide-react";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";

interface PublicDestinationListProps {
    categories: Array<{
        id: string;
        name: string;
    }>;
}

const scoreFilters = [
    { value: "all", label: "Semua skor" },
    { value: "80", label: "Skor 80+" },
    { value: "60", label: "Skor 60+" },
] as const;

const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "score", label: "Skor tertinggi" },
    { value: "rating", label: "Rating tertinggi" },
    { value: "reviews", label: "Ulasan terbanyak" },
    { value: "name", label: "Nama A-Z" },
] as const;

function ScoreBadge({ score }: { score: number | null }) {
    if (score === null) return null;
    const color =
        score >= 80
            ? "bg-green-100 text-green-800 border-green-200"
            : score >= 60
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-red-100 text-red-800 border-red-200";
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
                color,
            )}
        >
            <Star className="size-3 fill-current" />
            {score}
        </span>
    );
}

function DestinationCard({ dest }: { dest: Destination }) {
    const primaryImage =
        dest.images && dest.images.length > 0
            ? dest.images[0].imageUrl
            : null;
    const displayScore = dest.validatedScore ?? dest.halalScore ?? null;

    return (
        <Link
            href={`/destinasi/${dest.id}`}
            className="group block rounded-xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className="relative h-48 bg-[#f2ecf4] overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={dest.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <MapPin className="h-10 w-10 text-[#cbc4d2]" />
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <ScoreBadge score={displayScore} />
                </div>
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-heading font-semibold text-[#1f1635] group-hover:text-[#4f378a] transition-colors line-clamp-1">
                    {dest.name}
                </h3>
                {dest.city && (
                    <p className="flex items-center gap-1.5 text-sm text-[#494551]">
                        <MapPin className="size-3.5 shrink-0" />
                        {dest.city}
                        {dest.province && `, ${dest.province}`}
                    </p>
                )}
                {dest.category && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#eaddff] text-[#4f378a] font-medium">
                        {dest.category.name}
                    </span>
                )}
            </div>
        </Link>
    );
}

export function PublicDestinationList({ categories }: PublicDestinationListProps) {
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [minScore, setMinScore] = useState("all");
    const [sort, setSort] = useState("newest");
    const deferredSearch = useDeferredValue(search);

    const hasActiveFilters =
        categoryId !== "all" || minScore !== "all" || sort !== "newest";

    const params = useMemo(() => {
        const p: Record<string, string> = { status: "APPROVED" };
        if (deferredSearch.trim()) p.search = deferredSearch.trim();
        if (categoryId !== "all") p.categoryId = categoryId;
        if (minScore !== "all") p.minScore = minScore;
        if (sort !== "newest") p.sort = sort;
        return p;
    }, [categoryId, deferredSearch, minScore, sort]);

    const { data, isLoading, error, hasMore, loadMore } =
        useCursorPagination<Destination>({
            url: "/api/destinations",
            limit: 12,
            params,
        });

    return (
        <div className="space-y-8">
            <div className="rounded-xl border border-white/50 bg-white/75 p-4 shadow-sm backdrop-blur-md">
                <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_160px_190px_auto]">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#494551]" />
                        <input
                            type="search"
                            placeholder="Cari destinasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-md border border-stone-200 bg-white pl-10 pr-4 text-sm text-[#1f1635] shadow-xs placeholder:text-[#494551]/60 focus:border-[#4f378a] focus:outline-none focus:ring-2 focus:ring-[#4f378a]/20"
                        />
                    </div>

                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="h-10 border-stone-200 bg-white text-[#1f1635]">
                            <SlidersHorizontal className="mr-2 size-4 text-[#494551]" />
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua kategori</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={minScore} onValueChange={setMinScore}>
                        <SelectTrigger className="h-10 border-stone-200 bg-white text-[#1f1635]">
                            <Star className="mr-2 size-4 text-[#494551]" />
                            <SelectValue placeholder="Skor" />
                        </SelectTrigger>
                        <SelectContent>
                            {scoreFilters.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="h-10 border-stone-200 bg-white text-[#1f1635]">
                            <ArrowDownUp className="mr-2 size-4 text-[#494551]" />
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 border-stone-200 bg-white text-[#494551] hover:bg-stone-50 md:w-10 md:px-0"
                        disabled={!hasActiveFilters && !search}
                        onClick={() => {
                            setSearch("");
                            setCategoryId("all");
                            setMinScore("all");
                            setSort("newest");
                        }}
                        aria-label="Reset filter"
                    >
                        <X className="size-4" />
                        <span className="md:sr-only">Reset</span>
                    </Button>
                </div>
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
                        <Loader2 className="h-6 w-6 animate-spin text-[#6750a4]" />
                    </div>
                }
                endComponent={
                    data.length > 0 ? (
                        <p className="text-center text-sm text-[#494551]/60 py-8">
                            Semua destinasi telah dimuat
                        </p>
                    ) : !isLoading ? (
                        <p className="text-center text-sm text-[#494551]/60 py-8">
                            {search || hasActiveFilters
                                ? "Tidak ada destinasi yang sesuai"
                                : "Belum ada destinasi tersedia"}
                        </p>
                    ) : null
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((dest) => (
                        <DestinationCard key={dest.id} dest={dest} />
                    ))}
                </div>
            </InfiniteScroll>
        </div>
    );
}
