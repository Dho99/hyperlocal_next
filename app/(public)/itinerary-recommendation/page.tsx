"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Calendar,
    MapPin,
    Clock,
    Loader2,
    ArrowLeft,
    Bookmark,
    Navigation,
    Building2,
    Store,
    CheckCircle2,
    Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/cloudinary/image-url";
import {
    getFacilityIcon,
    getFacilityIconBg,
} from "@/fitur/destinasi/data/destinasi-detail-data";
import SaveButton from "./components/save-button";

interface ItineraryItemData {
    orderIndex: number;
    destinationId: string;
    notes: string;
}

interface DestinationInfo {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    imageUrl: string | null;
    categoryName: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface ItineraryFacility {
    id: string;
    name: string;
    instanceName: string | null;
    type: string | null;
    distanceMeters: number | null;
    travelMinutes: number | null;
    latitude: number | null;
    longitude: number | null;
}

interface ItineraryUmkm {
    id: string;
    name: string;
    slug: string;
    categoryName: string | null;
    rating: number | null;
    reviewCount: number | null;
    primaryImage: string | null;
    validCertification: boolean;
    distanceMeters: number | null;
}

interface ItineraryPayload {
    title: string;
    days: number;
    items: ItineraryItemData[];
    destinations: Record<string, DestinationInfo>;
    facilities?: Record<string, ItineraryFacility[]>;
    umkms?: Record<string, ItineraryUmkm[]>;
}

function formatMeters(meters: number | null): string {
    if (meters == null) return "Di sekitar destinasi";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

function ItineraryContent() {
    const router = useRouter();
    const [payload, setPayload] = useState<ItineraryPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem("itinerary_payload");
        if (!raw) {
            router.replace("/");
            return;
        }
        try {
            const data = JSON.parse(raw) as ItineraryPayload;
            setPayload(data);
        } catch {
            router.replace("/");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleSave = useCallback(async () => {
        if (!payload) return;

        // const { data: session } = authClient.useSession();
        // if (!session) {
        //     toast.error(
        //         "Silakan login terlebih dahulu untuk menyimpan rencana",
        //     );
        //     setTimeout(() => router.push("/halal"), 1500);
        //     return;
        // }

        setSaving(true);
        try {
            const res = await fetch("/api/itineraries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: payload.title,
                    items: payload.items.map((item, idx) => ({
                        destinationId: item.destinationId,
                        dayNumber: Math.min(
                            Math.floor(
                                idx /
                                    Math.ceil(
                                        payload.items.length / payload.days,
                                    ),
                            ) + 1,
                            payload.days,
                        ),
                        orderIndex: item.orderIndex,
                        notes: item.notes,
                    })),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Gagal menyimpan");
            }

            toast.success("Rencana perjalanan berhasil disimpan!");
            sessionStorage.removeItem("itinerary_payload");
            setTimeout(() => router.push("/profile?tab=my-itinerary"), 1000);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }, [payload, router]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!payload) return null;

    const itemsByDay: Record<number, ItineraryItemData[]> = {};
    for (const item of payload.items) {
        const dayNum = Math.min(
            Math.floor(
                payload.items.indexOf(item) /
                    Math.ceil(payload.items.length / payload.days),
            ) + 1,
            payload.days,
        );
        if (!itemsByDay[dayNum]) itemsByDay[dayNum] = [];
        itemsByDay[dayNum].push(item);
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={() => {
                        sessionStorage.removeItem("itinerary_payload");
                        router.push("/");
                    }}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Beranda
                </button>

                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold text-foreground">
                        {payload.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Rencana perjalanan yang dibuat khusus untuk Anda
                    </p>
                </div>

                <div className="space-y-8">
                    {Object.entries(itemsByDay).map(([dayNum, items]) => (
                        <div key={dayNum}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">
                                    Hari {dayNum}
                                </h2>
                                <span className="text-sm text-muted-foreground">
                                    {items.length} destinasi
                                </span>
                            </div>

                            <div className="relative ml-5 space-y-6 border-l-2 border-emerald-200 pl-6 dark:border-emerald-800">
                                {items.map((item, idx) => {
                                    const dest =
                                        payload.destinations[
                                            item.destinationId
                                        ];
                                    if (!dest) return null;

                                    return (
                                        <div
                                            key={item.destinationId}
                                            className="relative rounded-xl border border-border bg-card p-5 shadow-sm"
                                        >
                                            <div className="absolute -left-[30px] top-6 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                                {idx + 1}
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {dest.imageUrl ? (
                                                        <Image
                                                            src={
                                                                normalizeImageUrl(dest.imageUrl) ??
                                                                dest.imageUrl
                                                            }
                                                            alt={dest.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="128px"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <MapPin className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-foreground">
                                                                {dest.name}
                                                            </h3>
                                                            {dest.categoryName && (
                                                                <span className="mt-0.5 inline-block rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
                                                                    {
                                                                        dest.categoryName
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {dest.city && (
                                                        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {dest.city}
                                                        </p>
                                                    )}

                                                    {item.notes && (
                                                        <div className="mt-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/60">
                                                            <p className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-200">
                                                                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                                {item.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                            className="border-border bg-background text-foreground hover:bg-muted hover:text-emerald-700 dark:hover:text-emerald-300"
                                                        >
                                                            <a
                                                                href={`/destinasi/${dest.id}`}
                                                                target="_blank"
                                                            >
                                                                <Bookmark className="mr-1 h-3.5 w-3.5" />
                                                                Detail
                                                            </a>
                                                        </Button>
                                                        {dest.latitude &&
                                                            dest.longitude && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                    className="border-border bg-background text-foreground hover:bg-muted"
                                                                >
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${dest.latitude},${dest.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Navigation className="mr-1 h-3.5 w-3.5" />
                                                                        Maps
                                                                    </a>
                                                                </Button>
                                                            )}
                                                    </div>

                                                    {payload.facilities?.[
                                                        item.destinationId
                                                    ]?.length ? (
                                                        <div className="mt-4">
                                                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                <Building2 className="h-3.5 w-3.5" />
                                                                Fasilitas
                                                                Terdekat
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {payload.facilities[
                                                                    item
                                                                        .destinationId
                                                                ].map(
                                                                    (fac) => {
                                                                        const Icon =
                                                                            getFacilityIcon(
                                                                                fac.type,
                                                                            );
                                                                        const iconBg =
                                                                            getFacilityIconBg(
                                                                                fac.type,
                                                                            );
                                                                        const mapsHref =
                                                                            fac.latitude !=
                                                                                null &&
                                                                            fac.longitude !=
                                                                                null
                                                                                ? `https://www.google.com/maps?q=${fac.latitude},${fac.longitude}`
                                                                                : null;
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    fac.id
                                                                                }
                                                                                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5"
                                                                            >
                                                                                <span
                                                                                    className={cn(
                                                                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                                                                                        iconBg,
                                                                                    )}
                                                                                >
                                                                                    <Icon className="size-3.5" />
                                                                                </span>
                                                                                <span className="font-medium text-foreground">
                                                                                    {fac.instanceName ||
                                                                                        fac.name}
                                                                                </span>
                                                                                <span className="text-muted-foreground">
                                                                                    {formatMeters(
                                                                                        fac.distanceMeters,
                                                                                    )}
                                                                                    {fac.travelMinutes !=
                                                                                        null
                                                                                        ? ` • ±${fac.travelMinutes} mnt`
                                                                                        : ""}
                                                                                </span>
                                                                                {mapsHref && (
                                                                                    <a
                                                                                        href={
                                                                                            mapsHref
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                                                                                    >
                                                                                        Maps
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {payload.umkms?.[
                                                        item.destinationId
                                                    ]?.length ? (
                                                        <div className="mt-4">
                                                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                <Store className="h-3.5 w-3.5" />
                                                                UMKM Terkait
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {payload.umkms[
                                                                    item
                                                                        .destinationId
                                                                ].map(
                                                                    (umkm) => (
                                                                        <a
                                                                            key={
                                                                                umkm.id
                                                                            }
                                                                            href={`/umkm/${umkm.id}`}
                                                                            target="_blank"
                                                                            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-2 transition-colors hover:border-emerald-300 hover:bg-muted/70"
                                                                        >
                                                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-accent">
                                                                                {umkm.primaryImage ? (
                                                                                    <Image
                                                                                        src={
                                                                                            normalizeImageUrl(
                                                                                                umkm.primaryImage,
                                                                                            ) ?? umkm.primaryImage
                                                                                        }
                                                                                        alt={
                                                                                            umkm.name
                                                                                        }
                                                                                        fill
                                                                                        sizes="48px"
                                                                                        className="object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex h-full items-center justify-center">
                                                                                        <Store className="size-5 text-border" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="line-clamp-1 text-sm font-bold text-foreground">
                                                                                        {
                                                                                            umkm.name
                                                                                        }
                                                                                    </span>
                                                                                    {umkm.validCertification && (
                                                                                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                                                                                    )}
                                                                                </div>
                                                                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                                                    {umkm.categoryName ??
                                                                                        "UMKM"}
                                                                                    {umkm.distanceMeters !=
                                                                                        null
                                                                                        ? ` • ${formatMeters(umkm.distanceMeters)}`
                                                                                        : ""}
                                                                                </p>
                                                                                {umkm.rating !=
                                                                                    null && (
                                                                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                                                                                        <Star className="size-3 fill-[#e7c365] text-[#e7c365]" />
                                                                                        {umkm.rating.toFixed(
                                                                                            1,
                                                                                        )}
                                                                                        {umkm.reviewCount !=
                                                                                            null && (
                                                                                            <span className="font-normal text-muted-foreground">
                                                                                                (
                                                                                                {
                                                                                                    umkm.reviewCount
                                                                                                }
                                                                                                )
                                                                                            </span>
                                                                                        )}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </a>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-center border-t border-border pt-8">
                    <SaveButton onClick={handleSave} saving={saving} />
                </div>
            </div>
        </main>
    );
}

// function SaveButton({
//     onClick,
//     saving,
// }: {
//     onClick: () => void;
//     saving: boolean;
// }) {
//     const { data: session, isPending } = authClient.useSession();

//     const handleClick = () => {
//         if (!session) {
//             toast.error(
//                 "Silakan login terlebih dahulu untuk menyimpan rencana",
//             );
//             return;
//         }
//         onClick();
//     };

//     return (
//         <Button
//             onClick={handleClick}
//             disabled={saving || isPending}
//             className="h-12 bg-emerald-700 px-8 text-base font-bold text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-800"
//         >
//             {saving ? (
//                 <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     Menyimpan...
//                 </>
//             ) : (
//                 <>
//                     <Bookmark className="mr-2 h-5 w-5" />
//                     Simpan ke Rencana Perjalanan Saya
//                 </>
//             )}
//         </Button>
//     );
// }

export default function ItineraryRecommendationPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            }
        >
            <ItineraryContent />
        </Suspense>
    );
}
