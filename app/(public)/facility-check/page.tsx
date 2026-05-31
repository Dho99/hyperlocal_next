"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Loader2,
    CheckCircle2,
    AlertTriangle,
    MapPin,
    ArrowLeft,
    ExternalLink,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DestinationInfo {
    id: string;
    name: string;
    slug: string;
    city: string | null;
}

interface FacilityInfo {
    id: string;
    name: string;
    facilityType: string | null;
}

interface EvidenceInfo {
    id: string;
    imageUrl: string;
}

interface FacilityVerifyResponse {
    found: boolean;
    destination: DestinationInfo | null;
    facility: FacilityInfo | null;
    evidences: EvidenceInfo[];
}

function FacilityCheckContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = searchParams.get("slug") ?? "";
    const facility = searchParams.get("facility") ?? "";

    const [data, setData] = useState<FacilityVerifyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!slug || !facility) {
            setLoading(false);
            setError("Parameter slug dan facility wajib diisi.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/destinasi/facility-verify?slug=${encodeURIComponent(slug)}&facility=${encodeURIComponent(facility)}`,
            );
            if (!res.ok) throw new Error("Gagal memuat data");
            const json = (await res.json()) as FacilityVerifyResponse;
            setData(json);
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }, [slug, facility]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!slug || !facility) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center">
                    <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                    <h2 className="mt-4 text-lg font-semibold text-amber-900">
                        Parameter Tidak Lengkap
                    </h2>
                    <p className="mt-1 text-sm text-amber-700">
                        Silakan gunakan fitur pencarian untuk mengecek fasilitas
                        destinasi.
                    </p>
                    <Button
                        onClick={() => router.push("/")}
                        className="mt-4 bg-amber-700 hover:bg-amber-800 text-white"
                    >
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali
            </button>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-20 rounded-xl bg-stone-200" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-lg bg-stone-200"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                    <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                    <Button
                        onClick={fetchData}
                        className="mt-4 bg-stone-700 hover:bg-stone-800 text-white"
                    >
                        Coba Lagi
                    </Button>
                </div>
            )}

            {/* Facility found */}
            {data && data.found && !loading && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold text-emerald-900">
                                    Fasilitas Tersedia
                                </h2>
                                <p className="mt-1 text-sm text-emerald-700">
                                    <span className="font-semibold">
                                        {data.facility?.name ?? facility}
                                    </span>{" "}
                                    tersedia di{" "}
                                    <span className="font-semibold">
                                        {data.destination?.name ?? slug}
                                    </span>
                                    {data.destination?.city &&
                                        `, ${data.destination.city}`}
                                    .
                                </p>
                                {data.destination && (
                                    <div className="mt-3 flex items-center gap-4 text-xs text-emerald-600">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {data.destination.name}
                                        </span>
                                        {data.facility?.facilityType && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                                                {data.facility.facilityType}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {data.evidences.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-stone-700">
                                Bukti Foto Fasilitas ({data.evidences.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {data.evidences.map((ev) => (
                                    <a
                                        key={ev.id}
                                        href={ev.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative overflow-hidden rounded-lg border border-stone-200 bg-stone-50"
                                    >
                                        <div className="relative aspect-square">
                                            <Image
                                                src={ev.imageUrl}
                                                alt="Foto fasilitas"
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, 33vw"
                                            />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.destination && (
                        <Button
                            onClick={() =>
                                router.push(
                                    `/destinasi/${data?.destination?.id as string}`,
                                )
                            }
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Lihat Detail Destinasi
                        </Button>
                    )}
                </div>
            )}

            {/* Facility not found */}
            {data && !data.found && !loading && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold text-amber-900">
                                    Fasilitas Tidak Ditemukan
                                </h2>
                                <p className="mt-1 text-sm text-amber-700">
                                    Fasilitas{" "}
                                    <span className="font-semibold">
                                        {facility}
                                    </span>{" "}
                                    belum terverifikasi di area{" "}
                                    <span className="font-semibold">
                                        {slug}
                                    </span>
                                    .
                                </p>
                                <p className="mt-2 text-xs text-amber-600">
                                    Mungkin fasilitas tersebut belum terdaftar
                                    atau menggunakan nama yang berbeda.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-white p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                                <Search className="h-5 w-5 text-stone-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-stone-800">
                                    Cari Fasilitas Serupa
                                </h3>
                                <p className="mt-1 text-sm text-stone-500">
                                    Temukan destinasi lain yang memiliki
                                    fasilitas yang Anda cari di sekitar area
                                    ini.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/explore?q=${encodeURIComponent(facility)}`,
                                        )
                                    }
                                    className="mt-3 bg-stone-700 hover:bg-stone-800 text-white gap-2"
                                >
                                    <Search className="h-4 w-4" />
                                    Cari Fasilitas Terdekat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FacilityCheckPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-3xl px-4 py-10">
                    <div className="space-y-6 animate-pulse">
                        <div className="h-20 rounded-xl bg-stone-200" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-lg bg-stone-200"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <FacilityCheckContent />
        </Suspense>
    );
}
