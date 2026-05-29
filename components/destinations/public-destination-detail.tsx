"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft,
    MapPin,
    Star,
    ShieldCheck,
    Image as ImageIcon,
    Utensils,
    Building2,
    Hotel,
    Bookmark,
    Share2,
    Heart,
    User,
    Loader2,
    AlertCircle,
    Navigation,
    Store,
    CheckCircle2,
    Copy,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { Destination } from "@/types/destination";
import type { PublicReview } from "@/types/review";
import { getDestination } from "@/lib/api/destination";
import { getDestinationReviews } from "@/lib/api/review";
import { getApiErrorMessage } from "@/lib/api-error";
import { api } from "@/lib/axios";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { cn } from "@/lib/utils";
import Navbar from "../ui/navbar";

const DynamicContextMap = dynamic(
    () => import("@/components/maps").then((m) => m.DynamicContextMap),
    { ssr: false },
);

interface PublicDestinationDetailProps {
    id: string;
}

function formatRelativeDate(date: Date | string) {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} Hari Lalu`;
}

function StarRating({
    rating,
    size = "sm",
}: {
    rating: number;
    size?: "sm" | "md";
}) {
    const cls = size === "md" ? "size-5" : "size-3.5";
    return (
        <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        cls,
                        i < Math.round(rating)
                            ? "fill-[#e7c365] text-[#e7c365]"
                            : "fill-[#e6e0e9] text-[#e6e0e9]",
                    )}
                />
            ))}
        </span>
    );
}

const FACILITY_ICONS: Record<string, typeof Building2> = {
    masjid: Building2,
    mosque: Building2,
    restaurant: Utensils,
    kuliner: Utensils,
    hotel: Hotel,
    penginapan: Hotel,
};

function getFacilityIcon(type: string | null | undefined) {
    return FACILITY_ICONS[type?.toLowerCase() ?? ""] ?? Building2;
}

const FACILITY_BG: Record<string, string> = {
    masjid: "bg-[#e9ddff] text-[#22005d]",
    mosque: "bg-[#e9ddff] text-[#22005d]",
    restaurant: "bg-[#e9ddff] text-[#1f1635]",
    kuliner: "bg-[#e9ddff] text-[#1f1635]",
    hotel: "bg-[#ffdf93] text-[#241a00]",
    penginapan: "bg-[#ffdf93] text-[#241a00]",
};

function getFacilityIconBg(type: string | null | undefined): string {
    return (
        FACILITY_BG[type?.toLowerCase() ?? ""] ?? "bg-[#e9ddff] text-[#22005d]"
    );
}

function isMosqueFacility(type: string | null | undefined, name: string) {
    const value = `${type ?? ""} ${name}`.toLowerCase();
    return (
        value.includes("masjid") ||
        value.includes("mushola") ||
        value.includes("musholla") ||
        value.includes("mosque") ||
        value.includes("prayer")
    );
}

function formatDistance(distance: number | null) {
    if (distance == null) return "Di sekitar destinasi";
    return distance < 1
        ? `${Math.round(distance * 1000)} m`
        : `${distance.toFixed(1)} km`;
}

function googleMapsUrl(destination: Destination) {
    if (destination.latitude != null && destination.longitude != null) {
        return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [destination.name, destination.address, destination.city]
            .filter(Boolean)
            .join(", "),
    )}`;
}

function getSavedDestinationIds() {
    try {
        const value = window.localStorage.getItem("savedDestinations");
        const parsed = JSON.parse(value ?? "[]");
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : [];
    } catch {
        return [];
    }
}

export function PublicDestinationDetail({ id }: PublicDestinationDetailProps) {
    const router = useRouter();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [saved, setSaved] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const [dest, reviewData] = await Promise.all([
                    getDestination(id),
                    getDestinationReviews(id),
                ]);
                setDestination(dest);
                setReviews(reviewData);
            } catch (err: unknown) {
                setError(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        const savedIds = getSavedDestinationIds();
        queueMicrotask(() => setSaved(savedIds.includes(id)));
    }, [id]);

    useEffect(() => {
        api.post(`/destinations/${id}/interactions`, {
            type: "VIEW",
            source: "destination_detail",
        }).catch(() => undefined);
    }, [id]);

    const primaryImage = useMemo(() => {
        if (!destination?.images?.length) return null;
        const primary = destination.images.find(
            (img) => "isPrimary" in img && img.isPrimary === true,
        );
        return primary?.imageUrl ?? destination.images[0].imageUrl;
    }, [destination]);

    const secondaryImages = useMemo(() => {
        if (!destination?.images?.length) return [];
        return destination.images
            .slice(0, 3)
            .filter((img) => img.imageUrl !== primaryImage);
    }, [destination, primaryImage]);

    const allFacilities = useMemo(() => {
        if (!destination?.destinationHalalFacilities?.length) return [];
        return destination.destinationHalalFacilities
            .map((dhf) => {
                const dist =
                    destination.latitude != null &&
                    destination.longitude != null &&
                    dhf.latitude != null &&
                    dhf.longitude != null
                        ? haversineDistance(
                              Number(destination.latitude),
                              Number(destination.longitude),
                              dhf.latitude,
                              dhf.longitude,
                          )
                        : null;
                return {
                    id: dhf.id,
                    name: dhf.facility?.name ?? "Fasilitas",
                    type: dhf.facility?.facilityType ?? null,
                    distance: dist,
                    maxDistance: dhf.facility?.maxDistance ?? null,
                };
            })
            .sort(
                (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
            );
    }, [destination]);

    const mosqueFacilities = useMemo(
        () => allFacilities.filter((fac) => isMosqueFacility(fac.type, fac.name)),
        [allFacilities],
    );

    const nearbyFacilities = useMemo(
        () =>
            allFacilities.filter(
                (fac) => !isMosqueFacility(fac.type, fac.name),
            ),
        [allFacilities],
    );

    const nearbyUmkms = useMemo(() => {
        if (!destination?.umkms?.length) return [];
        return destination.umkms
            .map((umkm) => ({
                ...umkm,
                distance:
                    destination.latitude != null &&
                    destination.longitude != null &&
                    umkm.latitude != null &&
                    umkm.longitude != null
                        ? haversineDistance(
                              Number(destination.latitude),
                              Number(destination.longitude),
                              umkm.latitude,
                              umkm.longitude,
                          )
                        : null,
                primaryImage:
                    umkm.images?.find((image) => image.isPrimary)?.imageUrl ??
                    umkm.images?.[0]?.imageUrl ??
                    null,
                validCertification: umkm.certifications?.some(
                    (cert) => cert.status === "VALID",
                ),
            }))
            .sort(
                (a, b) =>
                    (a.distance ?? Infinity) - (b.distance ?? Infinity) ||
                    (b.rating ?? 0) - (a.rating ?? 0),
            );
    }, [destination]);

    const mapData = useMemo(() => {
        if (
            !destination ||
            destination.latitude == null ||
            destination.longitude == null
        )
            return null;
        return {
            id: destination.id,
            name: destination.name,
            latitude: Number(destination.latitude),
            longitude: Number(destination.longitude),
            facilities: (destination.destinationHalalFacilities ?? [])
                .filter((f) => f.latitude != null && f.longitude != null)
                .map((f) => ({
                    id: f.id,
                    name: f.facility?.name ?? "",
                    type: f.facility?.facilityType ?? "",
                    latitude: f.latitude!,
                    longitude: f.longitude!,
                })),
        };
    }, [destination]);

    const trackInteraction = useCallback(
        (type: "SAVE" | "SHARE" | "ROUTE" | "CLICK") => {
            api.post(`/destinations/${id}/interactions`, {
                type,
                source: "destination_detail",
            }).catch(() => undefined);
        },
        [id],
    );

    const handleSave = useCallback(() => {
        const savedIds = getSavedDestinationIds();
        const nextSaved = !saved;
        const nextIds = nextSaved
            ? Array.from(new Set([...savedIds, id]))
            : savedIds.filter((savedId) => savedId !== id);
        window.localStorage.setItem("savedDestinations", JSON.stringify(nextIds));
        setSaved(nextSaved);
        if (nextSaved) trackInteraction("SAVE");
    }, [id, saved, trackInteraction]);

    const handleShare = useCallback(async () => {
        if (!destination) return;
        const url = window.location.href;
        trackInteraction("SHARE");

        if (navigator.share) {
            try {
                await navigator.share({ title: destination.name, url });
                return;
            } catch {
                return;
            }
        }

        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
    }, [destination, trackInteraction]);

    const handleRoute = useCallback(() => {
        if (!destination) return;
        trackInteraction("ROUTE");
        window.open(googleMapsUrl(destination), "_blank", "noopener,noreferrer");
    }, [destination, trackInteraction]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                        Memuat destinasi...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="max-w-md text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                    <h2 className="mt-4 text-xl font-bold text-foreground">
                        Gagal Memuat Data
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    if (!destination) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="max-w-md text-center">
                    <MapPin className="mx-auto h-12 w-12 text-border" />
                    <h2 className="mt-4 text-xl font-bold text-foreground">
                        Destinasi Tidak Ditemukan
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Destinasi yang Anda cari tidak tersedia atau telah
                        dihapus.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navbar */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-6 sm:space-y-8">
                {/* Hero Gallery Bento */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 h-auto md:h-[614px] rounded-xl overflow-hidden shadow-md">
                    <div className="md:col-span-3 bg-accent relative group min-h-[280px] md:min-h-0">
                        {primaryImage ? (
                            <Image
                                src={primaryImage}
                                alt={destination.name}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-700 group-hover:scale-105",
                                    heroLoaded ? "opacity-100" : "opacity-0",
                                )}
                                onLoad={() => setHeroLoaded(true)}
                                priority
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <ImageIcon className="h-16 w-16 text-border" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            aria-pressed={saved}
                            aria-label={
                                saved
                                    ? "Hapus dari simpanan"
                                    : "Simpan destinasi"
                            }
                            className={cn(
                                "absolute top-4 right-4 bg-background/70 backdrop-blur-md p-2 rounded-full transition-colors shadow-sm",
                                saved
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary",
                            )}
                        >
                            <Heart
                                className={cn(
                                    "size-5",
                                    saved && "fill-current",
                                )}
                            />
                        </button>
                    </div>
                    <div className="hidden md:flex flex-col gap-2 md:gap-3">
                        {secondaryImages.slice(0, 2).map((img, idx) => (
                            <div
                                key={idx}
                                className="flex-1 bg-accent overflow-hidden rounded-xl relative group"
                            >
                                <Image
                                    src={img.imageUrl}
                                    alt={`${destination.name} ${idx + 2}`}
                                    fill
                                    sizes="25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {idx === 1 && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer">
                                        <span className="text-white text-xs font-semibold tracking-wider flex items-center gap-1">
                                            <ImageIcon className="size-3.5" />
                                            Lihat Semua
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Info */}
                        <div className="space-y-2 pb-4 border-b border-border/30">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {destination.status === "APPROVED" && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e1d4fd] text-[#645a7d] text-xs font-semibold tracking-wide">
                                        <ShieldCheck className="size-3.5" />
                                        Verifikasi Halal
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-muted-foreground text-xs font-semibold tracking-wide">
                                    <MapPin className="size-3.5" />
                                    {[destination.city, destination.province]
                                        .filter(Boolean)
                                        .join(", ") || "Lokasi"}
                                </span>
                            </div>
                            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                                {destination.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                {destination.rating != null && (
                                    <div className="flex items-center gap-1">
                                        <Star className="size-4 fill-[#e7c365] text-[#e7c365]" />
                                        <span className="font-bold text-foreground">
                                            {destination.rating.toFixed(1)}
                                        </span>
                                        {destination.reviewCount != null && (
                                            <span>
                                                ({destination.reviewCount}{" "}
                                                ulasan)
                                            </span>
                                        )}
                                    </div>
                                )}
                                {destination.reviewCount != null &&
                                    destination.rating == null && (
                                        <span>
                                            ({destination.reviewCount} ulasan)
                                        </span>
                                    )}
                                {destination.category && (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <span>{destination.category.name}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {destination.description && (
                            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                <RichTextRenderer
                                    content={destination.description}
                                />
                            </div>
                        )}

                        {/* Nearby Facilities */}
                        {nearbyFacilities.length > 0 && (
                            <section>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                                    Fasilitas Terdekat
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {nearbyFacilities.map((fac) => {
                                        const Icon = getFacilityIcon(fac.type);
                                        const iconBg = getFacilityIconBg(
                                            fac.type,
                                        );
                                        return (
                                            <div
                                                key={fac.id}
                                                className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                                                        iconBg,
                                                    )}
                                                >
                                                    <Icon className="size-6" />
                                                </div>
                                                <h3 className="font-bold text-sm mb-1 text-foreground">
                                                    {fac.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistance(
                                                        fac.distance,
                                                    )}
                                                    {fac.type
                                                        ? ` • ${fac.type}`
                                                        : ""}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Nearby UMKM */}
                        {nearbyUmkms.length > 0 && (
                            <section>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                                    UMKM di Sekitar Destinasi
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {nearbyUmkms.slice(0, 4).map((umkm) => (
                                        <div
                                            key={umkm.id}
                                            className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm"
                                        >
                                            <div className="flex gap-3 p-3">
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-accent">
                                                    {umkm.primaryImage ? (
                                                        <Image
                                                            src={
                                                                umkm.primaryImage
                                                            }
                                                            alt={umkm.name}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Store className="size-7 text-border" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                                                            {umkm.name}
                                                        </h3>
                                                        {umkm.validCertification && (
                                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                                        )}
                                                    </div>
                                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                        {umkm.category?.name ??
                                                            "UMKM"}
                                                        {" • "}
                                                        {formatDistance(
                                                            umkm.distance,
                                                        )}
                                                    </p>
                                                    {umkm.rating != null && (
                                                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Nearby Mosque */}
                        {mosqueFacilities.length > 0 && (
                            <section>
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                                    Masjid dan Ruang Ibadah Terdekat
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {mosqueFacilities.slice(0, 4).map((fac) => (
                                        <div
                                            key={fac.id}
                                            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                                                <Building2 className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-bold text-foreground">
                                                    {fac.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistance(
                                                        fac.distance,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <div className="pt-4 border-t border-border/30">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                                    Ulasan Traveller
                                </h2>
                                {reviews.length > 5 && (
                                    <button
                                        type="button"
                                        className="text-xs font-semibold tracking-wide text-primary hover:underline"
                                    >
                                        Lihat Semua
                                    </button>
                                )}
                            </div>
                            {reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {reviews.slice(0, 5).map((review) => (
                                        <div
                                            key={review.id}
                                            className="bg-card p-4 sm:p-6 rounded-xl border border-border/50"
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                                                    {review.user.image ? (
                                                        <Image
                                                            src={
                                                                review.user
                                                                    .image
                                                            }
                                                            alt={
                                                                review.user.name
                                                            }
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        review.user.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                                        <div className="font-bold text-sm text-foreground">
                                                            {review.user.name}
                                                        </div>
                                                        <div className="flex text-[#e7c365]">
                                                            <StarRating
                                                                rating={
                                                                    review.rating
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {formatRelativeDate(
                                                            review.createdAt,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                                &ldquo;{review.comment}&rdquo;
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
                                    <User className="mx-auto h-8 w-8 text-border" />
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        Belum ada ulasan untuk destinasi ini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Cek Sekitar Map Widget */}
                            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-border/30">
                                    <h3 className="font-bold text-base text-foreground">
                                        Cek Sekitar
                                    </h3>
                                </div>
                                {mapData ? (
                                    <div className="h-48 bg-muted relative">
                                        <DynamicContextMap
                                            destination={mapData}
                                            className="h-full w-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-muted relative flex items-center justify-center">
                                        <MapPin className="h-8 w-8 text-border" />
                                    </div>
                                )}
                                <div className="p-4 bg-muted/30">
                                    <button
                                        type="button"
                                        onClick={handleRoute}
                                        className="w-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider py-3 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                        Buka Rute di Maps
                                    </button>
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                                <h3 className="font-bold text-base text-foreground mb-4">
                                    Mulai Perjalanan Anda
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleRoute}
                                        className="w-full bg-primary text-primary-foreground text-xs font-semibold tracking-wider py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Navigation className="size-4" />
                                        Arahkan Rute
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        aria-pressed={saved}
                                        className={cn(
                                            "w-full border text-xs font-semibold tracking-wider py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2",
                                            saved
                                                ? "bg-primary/10 border-primary/30 text-primary"
                                                : "bg-transparent border-border text-foreground hover:bg-muted",
                                        )}
                                    >
                                        <Bookmark
                                            className={cn(
                                                "size-4",
                                                saved && "fill-current",
                                            )}
                                        />
                                        {saved
                                            ? "Tersimpan"
                                            : "Simpan Destinasi"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="w-full bg-transparent border border-border text-foreground text-xs font-semibold tracking-wider py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
                                    >
                                        {shareCopied ? (
                                            <Copy className="size-4" />
                                        ) : (
                                            <Share2 className="size-4" />
                                        )}
                                        {shareCopied
                                            ? "Link Disalin"
                                            : "Bagikan Destinasi"}
                                    </button>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                                <h3 className="font-bold text-sm text-foreground mb-3">
                                    Informasi Singkat
                                </h3>
                                <div className="space-y-2.5 text-sm">
                                    {destination.category && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Kategori
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {destination.category.name}
                                            </span>
                                        </div>
                                    )}
                                    {destination.rating != null && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Rating
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                                                <Star className="size-3.5 fill-[#e7c365] text-[#e7c365]" />
                                                {destination.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                    {destination.address && (
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-muted-foreground shrink-0">
                                                Alamat
                                            </span>
                                            <span className="text-right font-medium text-foreground truncate max-w-[160px]">
                                                {destination.address}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Status
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                                                destination.status ===
                                                    "APPROVED"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : destination.status ===
                                                        "REJECTED"
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-amber-100 text-amber-800",
                                            )}
                                        >
                                            {destination.status === "APPROVED"
                                                ? "Terverifikasi"
                                                : destination.status ===
                                                    "REJECTED"
                                                  ? "Ditolak"
                                                  : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {destination.images && destination.images.length > 1 && (
                    <section>
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4">
                            Galeri Foto
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {destination.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-square overflow-hidden rounded-xl bg-accent"
                                >
                                    <Image
                                        src={img.imageUrl}
                                        alt={`${destination.name} ${idx + 1}`}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-8 bg-card w-full rounded-t-xl border-t border-border/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                    <div className="space-y-3">
                        <h3 className="font-heading text-xl font-bold text-primary">
                            HalalGo
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Platform penemuan destinasi halal terpercaya untuk
                            perjalanan yang menenangkan.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold tracking-widest text-primary">
                            PERUSAHAAN
                        </h4>
                        <a
                            href="#"
                            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                        >
                            Tentang Kami
                        </a>
                        <a
                            href="#"
                            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                        >
                            Bantuan
                        </a>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold tracking-widest text-primary">
                            LEGAL
                        </h4>
                        <a
                            href="#"
                            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                        >
                            Kebijakan Privasi
                        </a>
                        <a
                            href="#"
                            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                        >
                            Syarat &amp; Ketentuan
                        </a>
                    </div>
                    <div className="flex items-end text-sm text-muted-foreground">
                        <p>
                            &copy; {new Date().getFullYear()} HalalGo. Semua Hak
                            Dilindungi.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
