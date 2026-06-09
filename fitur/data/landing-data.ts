import { prisma } from "@/lib/prisma";
import { ShieldCheck, Landmark, Utensils, Hotel } from "lucide-react";
import type { ComponentType } from "react";
import type { Faq } from "./landing";

export interface DestinationCard {
    id: string;
    name: string;
    slug: string;
    location: string;
    category: string;
    rating: number;
    reviewCount: number;
    halalScore: number | null;
    status: string;
    imageUrl: string | null;
}

export interface FacilityHighlight {
    title: string;
    count: string;
    icon: ComponentType<{ className?: string }>;
}

export interface UmkmCard {
    id: string;
    name: string;
    rating: number | null;
    reviewCount: number | null;
    categoryName: string | null;
    location: string;
    hasCertification: boolean;
}

export interface ReviewCard {
    id: string;
    userName: string;
    rating: number;
    comment: string | null;
    destinationName: string | null;
}

export interface RouteIdea {
    location: string;
    name: string;
    imageUrl: string | null;
}

export function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

export function percent(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

export function locationLabel(city?: string | null, province?: string | null) {
    return [city, province].filter(Boolean).join(", ") || "Wilayah belum diisi";
}

function safeImage(src?: string | null) {
    if (!src) return null;
    if (src.startsWith("/")) return src;
    if (src.startsWith("https://images.unsplash.com/")) return src;
    if (src.startsWith("https://plus.unsplash.com/")) return src;
    return null;
}

export function scoreLabel(score: number | null) {
    if (score == null) return "Belum Dinilai";
    if (score >= 80) return "A-Grade";
    if (score >= 60) return "B-Grade";
    return "C-Grade";
}

function toDestinationCard(destination: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    status: string;
    rating: number | null;
    reviewCount: number | null;
    category: { name: string } | null;
    halalScore: number | null;
    images: Array<{ imageUrl: string }>;
}): DestinationCard {
    return {
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        location: locationLabel(destination.city, destination.province),
        category: destination.category?.name || "Destinasi",
        rating: destination.rating || 0,
        reviewCount: destination.reviewCount || 0,
        halalScore: destination.halalScore || null,
        status: destination.status,
        imageUrl: safeImage(destination.images[0]?.imageUrl),
    };
}

export const faqs: Faq[] = [
    {
        question: "Dari mana isi landing page diambil?",
        answer: "Angka, kategori, destinasi, fasilitas, UMKM, dan ulasan ditarik langsung dari database aplikasi.",
    },
    {
        question: "Apa arti skor pada kartu destinasi?",
        answer: "Skor publik saat ini dihitung dari rating destinasi approved karena database aktif belum memiliki kolom skor halal.",
    },
    {
        question: "Kenapa beberapa gambar tidak muncul?",
        answer: "Kartu akan menampilkan placeholder bila destinasi atau UMKM belum memiliki gambar yang tersimpan.",
    },
];

export async function getLandingData() {
    const [
        totalDestinations,
        approvedDestinations,
        totalUmkms,
        validCertifications,
        totalFacilities,
        categories,
        popularRaw,
        verifiedRaw,
        recentReviews,
        topUmkms,
    ] = await Promise.all([
        prisma.destination.count(),
        prisma.destination.count({ where: { status: "APPROVED" } }),
        prisma.umkm.count(),
        prisma.halalCertification.count({ where: { status: "VALID" } }),
        prisma.halalFacility.count(),
        prisma.category.findMany({
            take: 8,
            orderBy: [{ destinations: { _count: "desc" } }, { name: "asc" }],
            include: {
                _count: {
                    select: {
                        destinations: true,
                        umkms: true,
                    },
                },
            },
        }),
        prisma.destination.findMany({
            take: 8,
            where: { status: "APPROVED" },
            orderBy: [
                { reviewCount: "desc" },
                { rating: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                province: true,
                status: true,
                rating: true,
                reviewCount: true,
                halalScore: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
        prisma.destination.findMany({
            take: 6,
            where: { status: "APPROVED" },
            orderBy: [
                { rating: "desc" },
                { reviewCount: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                province: true,
                status: true,
                rating: true,
                reviewCount: true,
                halalScore: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
        prisma.review.findMany({
            take: 3,
            where: {
                comment: { not: null },
            },
            orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
            include: {
                user: true,
                destination: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
            },
        }),
        prisma.umkm.findMany({
            take: 6,
            orderBy: [
                { reviewCount: "desc" },
                { rating: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                rating: true,
                reviewCount: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                destination: {
                    select: {
                        city: true,
                        province: true,
                    },
                },
                certifications: {
                    where: { status: "VALID" },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
    ]);

    const popular = popularRaw.map(toDestinationCard);
    const verifiedSource = verifiedRaw.length ? verifiedRaw : popularRaw;
    const verified = verifiedSource.map(toDestinationCard).slice(0, 3);

    const facilityHighlights: FacilityHighlight[] = [
        {
            title: "Fasilitas Halal",
            count: `${formatNumber(totalFacilities)} item`,
            icon: Landmark,
        },
        {
            title: "UMKM Terdata",
            count: `${formatNumber(totalUmkms)} usaha`,
            icon: Utensils,
        },
        {
            title: "Sertifikasi Valid",
            count: `${formatNumber(validCertifications)} sertifikat`,
            icon: ShieldCheck,
        },
        {
            title: "Destinasi Approved",
            count: `${formatNumber(approvedDestinations)} lokasi`,
            icon: Hotel,
        },
    ];

    const routeIdeas = Array.from(
        new globalThis.Map(
            popular
                .filter((d) => d.location !== "Wilayah belum diisi")
                .map((d) => [d.location, d]),
        ).values(),
    ).slice(0, 3);

    const topUmkmCards: UmkmCard[] = topUmkms.map((umkm) => ({
        id: umkm.id,
        name: umkm.name,
        rating: umkm.rating,
        reviewCount: umkm.reviewCount,
        categoryName: umkm.category?.name ?? null,
        location: locationLabel(
            umkm.destination?.city,
            umkm.destination?.province,
        ),
        hasCertification: umkm.certifications.length > 0,
    }));

    const reviewCards: ReviewCard[] = recentReviews.map((review) => ({
        id: review.id,
        userName: review.user.name,
        rating: review.rating,
        comment: review.comment,
        destinationName: review.destination?.name ?? null,
    }));

    return {
        stats: {
            totalDestinations,
            approvedDestinations,
            totalUmkms,
            validCertifications,
            totalFacilities,
            verifiedPercent: percent(approvedDestinations, totalDestinations),
        },
        categories,
        popular,
        verified,
        reviewCards,
        topUmkmCards,
        facilityHighlights,
        routeIdeas,
    };
}
