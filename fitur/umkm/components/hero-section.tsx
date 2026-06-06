"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, BadgeCheck, Store, ArrowLeft } from "lucide-react";
import type { UmkmDetail } from "@/lib/services/umkm-service";
import { ScrollReveal } from "./scroll-reveal";
import { ReportDialog } from "@/components/report/report-dialog";
import { BookmarkButton } from "@/components/destinations/bookmark-button";

interface HeroSectionProps {
    umkm: UmkmDetail;
}

export function HeroSection({ umkm }: HeroSectionProps) {
    const router = useRouter();
    const coverImage = umkm.images?.[0]?.imageUrl;
    const hasCertification = umkm.certifications?.some(
        (c) => c.status === "VALID",
    );
    const avgRating =
        umkm.reviews.length > 0
            ? (
                  umkm.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  umkm.reviews.length
              ).toFixed(1)
            : umkm.rating?.toFixed(1) || "0.0";
    const reviewCount = umkm.reviews.length || umkm.reviewCount || 0;

    return (
        <ScrollReveal>
            <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={umkm.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-200">
                        <Store className="h-16 w-16 text-stone-400" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                <button
                    type="button"
                    onClick={() => router.push("/umkm")}
                    aria-label="Kembali ke menu kuliner"
                    className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/90 text-stone-700 shadow-sm transition hover:bg-stone-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
            </div>

            <div className="mx-auto max-w-7xl px-4 -mt-10 relative z-10">
                <div className="rounded-lg bg-stone-50 p-6 border border-stone-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-emerald-900 sm:text-4xl">
                                {umkm.name}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                {hasCertification && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                                        <BadgeCheck size={16} />
                                        Verified Halal
                                    </span>
                                )}
                                {umkm.category?.name && (
                                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
                                        {umkm.category.name}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-sm text-amber-700">
                                    <Star
                                        size={16}
                                        className="fill-current text-amber-500"
                                    />
                                    <span className="font-semibold">
                                        {avgRating}
                                    </span>
                                    <span className="text-stone-500">
                                        ({reviewCount} ulasan)
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookmarkButton
                                targetSlug={umkm.slug}
                                targetType="UMKM"
                                className="bg-white border-stone-200 shadow-sm"
                            />
                            <ReportDialog targetId={umkm.id} targetType="UMKM" />
                        </div>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
}
