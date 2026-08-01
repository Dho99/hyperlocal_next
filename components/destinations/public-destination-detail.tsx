"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/types/destination";
import type { PublicReview } from "@/types/review";
import { getDestination } from "@/lib/api/destination";
import { getDestinationReviews } from "@/lib/api/review";
import { getApiErrorMessage } from "@/lib/api-error";
import { api } from "@/lib/axios";
import { authClient } from "@/lib/auth-client";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import {
    googleMapsUrl,
    type NearbyUmkm,
} from "@/fitur/destinasi/data/destinasi-detail-data";
import { LoadingState } from "@/fitur/destinasi/components/loading-state";
import { ErrorState } from "@/fitur/destinasi/components/error-state";
import { NotFoundState } from "@/fitur/destinasi/components/not-found-state";
import { HeroGallery } from "@/fitur/destinasi/components/hero-gallery";
import { FacilitiesSection } from "@/fitur/destinasi/components/facilities-section";
import { UmkmSection } from "@/fitur/destinasi/components/umkm-section";
import { ReviewSection } from "@/fitur/destinasi/components/review-section";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import {
    ImageLightbox,
    useImageLightbox,
} from "@/components/ui/image-lightbox";
import { MapSidebar } from "@/fitur/destinasi/components/map-sidebar";
import { DetailFooter } from "@/fitur/destinasi/components/detail-footer";

interface PublicDestinationDetailProps {
    id: string;
}

interface PublicAceshAssessment {
    verifiedScore: number | null;
    baseScore: number | null;
    classification: string | null;
    verificationStatus: "PENDING" | "VERIFIED" | null;
    calculatedAt: string | null;
    calculationVersion: string | null;
}

const CLASSIFICATION_LABELS: Record<string, string> = {
    BELUM_SIAP: "Belum siap",
    PERLU_PENGEMBANGAN: "Perlu pengembangan",
    BERKEMBANG: "Berkembang",
    SIAP: "Siap",
    SANGAT_SIAP: "Sangat siap",
};

const CLASSIFICATION_STYLES: Record<string, string> = {
    BELUM_SIAP: "bg-red-50 text-red-700 ring-red-200",
    PERLU_PENGEMBANGAN: "bg-orange-50 text-orange-700 ring-orange-200",
    BERKEMBANG: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    SIAP: "bg-green-50 text-green-700 ring-green-200",
    SANGAT_SIAP: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function PublicDestinationDetail({ id }: PublicDestinationDetailProps) {
    const router = useRouter();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [acesh, setAcesh] = useState<PublicAceshAssessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const lightbox = useImageLightbox();
    const { data: session, isPending: sessionPending } =
        authClient.useSession();

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

        fetch(`/api/destinations/${id}/acesh`)
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (json?.data) {
                    setAcesh(json.data as PublicAceshAssessment);
                }
            })
            .catch(() => {
                // score badge is optional — detail still works without it
            });
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
                const dbDistKm =
                    dhf.distanceMeters != null ? dhf.distanceMeters / 1000 : null;
                const dist =
                    dbDistKm ??
                    (destination.latitude != null &&
                    destination.longitude != null &&
                    dhf.latitude != null &&
                    dhf.longitude != null
                        ? haversineDistance(
                              Number(destination.latitude),
                              Number(destination.longitude),
                              dhf.latitude,
                              dhf.longitude,
                          )
                        : null);
                return {
                    id: dhf.id,
                    name: dhf.facility?.name ?? "Fasilitas",
                    instanceName: dhf.name ?? null,
                    type: dhf.facility?.facilityType ?? null,
                    distance: dist,
                    maxDistance: dhf.facility?.maxDistance ?? null,
                    travelMinutes: dhf.travelMinutes ?? null,
                };
            })
            .sort(
                (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
            );
    }, [destination]);

    const nearbyUmkms: NearbyUmkm[] = useMemo(() => {
        if (!destination?.umkms?.length) return [];
        return destination.umkms
            .map((umkm) => {
                const distance =
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
                        : null;
                return {
                    id: umkm.id,
                    name: umkm.name,
                    slug: umkm.slug,
                    description: umkm.description,
                    address: umkm.address,
                    phone: umkm.phone,
                    latitude: umkm.latitude,
                    longitude: umkm.longitude,
                    rating: umkm.rating ?? null,
                    reviewCount: umkm.reviewCount ?? null,
                    distance,
                    primaryImage:
                        umkm.images?.find((image) => image.isPrimary)
                            ?.imageUrl ??
                        umkm.images?.[0]?.imageUrl ??
                        null,
                    validCertification:
                        umkm.certifications?.some(
                            (cert) => cert.status === "VALID",
                        ) ?? false,
                    category: umkm.category ?? null,
                };
            })
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
        if (!destination?.id) return;
        trackInteraction("ROUTE");
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetId: destination.id,
                targetType: "DESTINASI",
                actionType: "CLICK_ROUTE",
            }),
        }).catch(() => undefined);
        window.open(
            googleMapsUrl(destination),
            "_blank",
            "noopener,noreferrer",
        );
    }, [destination, trackInteraction]);

    const handleReviewSubmitted = useCallback(
        (_updatedReviews: PublicReview[]) => {},
        [],
    );

    if (loading) return <LoadingState />;
    if (error)
        return <ErrorState error={error} onBack={() => router.push("/")} />;
    if (!destination) return <NotFoundState onBack={() => router.push("/")} />;

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-6 sm:space-y-8">
                <HeroGallery
                    primaryImage={primaryImage}
                    secondaryImages={secondaryImages}
                    destination={destination}
                    heroLoaded={heroLoaded}
                    onHeroLoad={() => setHeroLoaded(true)}
                    onBack={() => router.push("/destinasi")}
                    destinationId={id}
                    onImageClick={lightbox.openAt}
                />

                {acesh && acesh.baseScore != null && (
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Skor ACES-H
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {acesh.verificationStatus === "VERIFIED" &&
                                acesh.verifiedScore != null
                                    ? acesh.verifiedScore.toFixed(1)
                                    : acesh.baseScore.toFixed(1)}
                            </p>
                        </div>
                        {acesh.classification && (
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                    CLASSIFICATION_STYLES[
                                        acesh.classification
                                    ] ?? "bg-muted text-muted-foreground ring-border"
                                }`}
                            >
                                {CLASSIFICATION_LABELS[acesh.classification] ??
                                    acesh.classification}
                            </span>
                        )}
                        <div className="text-xs text-muted-foreground">
                            {acesh.verificationStatus === "VERIFIED" ? (
                                <p>
                                    Skor terverifikasi · diperbarui{" "}
                                    {acesh.calculatedAt
                                        ? new Date(
                                              acesh.calculatedAt,
                                          ).toLocaleDateString("id-ID")
                                        : "-"}
                                </p>
                            ) : (
                                <p>
                                    Skor sementara — data belum sepenuhnya
                                    tervalidasi.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {destination.description && (
                            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                <RichTextRenderer
                                    content={destination.description}
                                />
                            </div>
                        )}

                        <FacilitiesSection facilities={allFacilities} />
                        <UmkmSection umkms={nearbyUmkms} />
                        <ReviewSection
                            destinationId={id}
                            initialReviews={reviews}
                            session={session}
                            sessionPending={sessionPending}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    </div>

                    <MapSidebar
                        destination={destination}
                        mapData={mapData}
                        shareCopied={shareCopied}
                        onRoute={handleRoute}
                        onShare={handleShare}
                        destinationId={id}
                    />
                </div>

                <PhotoGallery
                    images={destination.images ?? []}
                    name={destination.name}
                    heading="Galeri Foto"
                    controller={lightbox}
                    minImages={2}
                />
            </main>

            <ImageLightbox
                images={destination.images ?? []}
                open={lightbox.open}
                index={lightbox.index}
                onOpenChange={lightbox.setOpen}
                onIndexChange={lightbox.setIndex}
                alt={destination.name}
            />

            <DetailFooter />
        </div>
    );
}
