"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Loader2,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

interface ItineraryDestination {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    imageUrl: string | null;
    category: { name: string } | null;
}

interface ItineraryItem {
    id: string;
    dayNumber: number;
    orderIndex: number;
    notes: string | null;
    destination: ItineraryDestination;
}

interface Itinerary {
    id: string;
    title: string;
    city: string | null;
    createdAt: string;
    items: ItineraryItem[];
}

export default function MyItineraryTab() {
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const router = useRouter();

    const {
        data,
        isLoading: loading,
        hasMore,
        loadMore,
    } = useCursorPagination<Itinerary>({ url: "/api/itineraries" });

    const itineraries = useMemo(
        () => data.filter((i) => !removedIds.has(i.id)),
        [data, removedIds],
    );

    const handleDelete = useCallback(async (id: string) => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/itineraries/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Gagal menghapus");
            setRemovedIds((prev) => new Set(prev).add(id));
            toast.success("Rencana berhasil dihapus");
        } catch {
            toast.error("Gagal menghapus rencana");
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    if (loading && itineraries.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!loading && itineraries.length === 0) {
        return (
            <div className="rounded-xl border border-stone-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                        <Calendar className="h-8 w-8 text-stone-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-700">
                            Belum Ada Rencana Perjalanan
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Gunakan fitur pencarian di beranda untuk membuat
                            rencana perjalanan.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/")}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                        Buat Rencana Sekarang
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <InfiniteScroll hasMore={hasMore} isLoading={loading} next={loadMore}>
        <div className="space-y-4">
            {itineraries.map((itin) => {
                const isDeleting = deletingIds.has(itin.id);
                const isExpanded = expandedIds.has(itin.id);
                return (
                    <div
                        key={itin.id}
                        className={`rounded-xl border border-stone-200 bg-white shadow-sm ${
                            isDeleting ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                        <div
                            // type="button"
                            onClick={() => toggleExpand(itin.id)}
                            className="flex w-full items-center justify-between p-5 text-left hover:cursor-pointer"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-stone-800 truncate">
                                        {itin.title}
                                    </h3>
                                    <p className="text-sm text-stone-500">
                                        {itin.items.length} destinasi
                                        {itin.city && ` • ${itin.city}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(itin.id);
                                    }}
                                    disabled={isDeleting}
                                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-stone-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-stone-400" />
                                )}
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="border-t border-stone-100 px-5 pb-5 pt-3">
                                <div className="space-y-3">
                                    {itin.items.map((item) => (
                                        <div
                                            // href={`/destinasi/${item.destination.slug}`}
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-lg bg-stone-50 p-3"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                                {item.orderIndex}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <a
                                                    href={`/destinasi/${item.destination.slug}`}
                                                    className="font-medium text-stone-800 hover:text-emerald-700 transition-colors"
                                                >
                                                    {item.destination.name}
                                                </a>
                                                {item.destination.city && (
                                                    <p className="text-xs text-stone-500">
                                                        {item.destination.city}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="mt-1 text-xs text-stone-600 italic">
                                                        {item.notes}
                                                    </p>
                                                )}

                                                <Button
                                                    onClick={() =>
                                                        router.push(
                                                            `/destinasi/${item.destination.slug}`,
                                                        )
                                                    }
                                                    type="submit"
                                                    className="w-sm my-4 bg-emerald-700 hover:bg-emerald-800 text-white"
                                                >
                                                    Lihat Destinasi
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        </InfiniteScroll>
    );
}
