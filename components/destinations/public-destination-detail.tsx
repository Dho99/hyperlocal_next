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
import { HeaderInfo } from "@/fitur/destinasi/components/header-info";
import { FacilitiesSection } from "@/fitur/destinasi/components/facilities-section";
import { UmkmSection } from "@/fitur/destinasi/components/umkm-section";
import { ReviewSection } from "@/fitur/destinasi/components/review-section";
import { ImageGallery } from "@/fitur/destinasi/components/image-gallery";
import { MapSidebar } from "@/fitur/destinasi/components/map-sidebar";
import { DetailFooter } from "@/fitur/destinasi/components/detail-footer";

interface PublicDestinationDetailProps {
    id: string;
}

export function PublicDestinationDetail({ id }: PublicDestinationDetailProps) {
    const router = useRouter();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
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
                    instanceName: dhf.name ?? null,
                    type: dhf.facility?.facilityType ?? null,
                    distance: dist,
                    maxDistance: dhf.facility?.maxDistance ?? null,
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
        if (!destination) return;
        trackInteraction("ROUTE");
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetId: id,
                targetType: "DESTINASI",
                actionType: "CLICK_ROUTE",
            }),
        }).catch(() => undefined);
        window.open(
            googleMapsUrl(destination),
            "_blank",
            "noopener,noreferrer",
        );
    }, [destination, id, trackInteraction]);

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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-6 sm:space-y-8">
                <HeroGallery
                    primaryImage={primaryImage}
                    secondaryImages={secondaryImages}
                    name={destination.name}
                    heroLoaded={heroLoaded}
                    onHeroLoad={() => setHeroLoaded(true)}
                    destinationId={id}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <HeaderInfo destination={destination} />

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

                <ImageGallery
                    images={destination.images ?? []}
                    name={destination.name}
                />
            </main>

            <DetailFooter />
        </div>
    );
}
