"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

const TRIAGE_NOTE =
    "PERLU ATENSI KHUSUS: Skor awal di bawah ambang batas minimal ekosistem.";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Tervalidasi" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Ditolak" },
    REVISION: { bg: "bg-blue-50", text: "text-blue-700", label: "Revisi" },
};

function isTriageNote(note: string | null): boolean {
    return note?.includes(TRIAGE_NOTE) ?? false;
}

interface PendingAccommodation {
    id: string;
    name: string;
    city: string | null;
    rating: number | null;
    validationStatus: string;
    surveyorNote: string | null;
}

export function ValidationPendingAccommodationList() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING,REVISION");

    const params = useMemo(
        () => ({
            scope: "admin",
            search: search.trim() || undefined,
            validationStatus: statusFilter || undefined,
        }),
        [search, statusFilter],
    );

    const { data: accommodations, isLoading, hasMore, loadMore } =
        useCursorPagination<PendingAccommodation>({
            url: "/api/accommodations",
            params,
        });

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Cari nama penginapan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-stone-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-48"
                >
                    <option value="">Semua Status</option>
                    <option value="PENDING,REVISION">Perlu Tindakan</option>
                    <option value="PENDING">Pending</option>
                    <option value="REVISION">Revisi</option>
                    <option value="APPROVED">Tervalidasi</option>
                    <option value="REJECTED">Ditolak</option>
                </select>
            </div>

            <div className="border border-stone-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                    Nama Penginapan
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                    Kota
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                            {accommodations.length === 0 && !isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-16 text-center text-sm text-stone-400"
                                    >
                                        Tidak ada penginapan yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                accommodations.map((acc) => {
                                    const style = STATUS_STYLES[acc.validationStatus] ?? STATUS_STYLES.PENDING;
                                    const isHalalVerified = acc.validationStatus === "APPROVED";
                                    const hasTriage = isTriageNote(acc.surveyorNote);
                                    return (
                                        <tr key={acc.id} className={`transition-colors ${
                                            hasTriage
                                                ? "border-l-4 border-amber-400 bg-amber-50/50 hover:bg-amber-50/80"
                                                : "hover:bg-stone-50/50"
                                        }`}>
                                            <td className="py-3 px-4 font-medium text-stone-900">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span>{acc.name}</span>
                                                    {isHalalVerified && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                                                            ✓ Halal
                                                        </span>
                                                    )}
                                                    {hasTriage && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Perlu Atensi Khusus
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-stone-600">
                                                {acc.city || (
                                                    <span className="text-stone-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-stone-600">
                                                {acc.rating ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {acc.rating.toFixed(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                                                >
                                                    {style.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/validasi/penginapan/${acc.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                                                >
                                                    Proses
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <InfiniteScroll
                    hasMore={hasMore}
                    isLoading={isLoading}
                    next={loadMore}
                    loadingComponent={
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                        </div>
                    }
                />
            </div>
        </div>
    );
}
