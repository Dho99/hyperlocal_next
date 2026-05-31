import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

interface EngagementMetrics {
    views: number;
    saves: number;
    clicks: number;
    reviews: number;
    total: number;
}

interface DestinationGapItem {
    id: string;
    name: string;
    slug: string;
    type: "DESTINATION";
    city: string | null;
    imageUrl: string | null;
    status: string;
    validatedScore: number | null;
    halalScore: number | null;
    engagement: EngagementMetrics;
    severity: "HIGH" | "MEDIUM";
    actionText: string;
}

interface UmkmGapItem {
    id: string;
    name: string;
    slug: string;
    type: "UMKM";
    city: string | null;
    imageUrl: string | null;
    status: string;
    validationStatus: string;
    engagement: EngagementMetrics;
    severity: "HIGH" | "MEDIUM";
    actionText: string;
}

type GapItem = DestinationGapItem | UmkmGapItem;

function getEngagementPercentile(
    values: number[],
    percentile: number,
): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

function buildDestinationActionText(
    name: string,
    validatedScore: number | null,
): string {
    if (validatedScore == null) {
        return `${name} memiliki tingkat interaksi publik yang tinggi, namun belum memiliki Validated Score. Rekomendasi Tindakan: Segera utus tim surveyor lapangan untuk melakukan audit halal dan memberikan penilaian awal.`;
    }
    return `${name} memiliki tingkat interaksi publik yang tinggi, namun Validated Score rendah (${validatedScore}/100). Rekomendasi Tindakan: Segera utus tim surveyor lapangan untuk mengaudit sertifikasi fasilitas sanitasi wudu dan kelayakan tempat ibadah.`;
}

function buildUmkmActionText(name: string): string {
    return `${name} memiliki potensi pasar yang baik namun status validasi belum tervalidasi. Rekomendasi Tindakan: Prioritaskan proses validasi halal untuk memastikan produk sesuai standar ekosistem halal.`;
}

export async function GET() {
    try {
        const [destinations, trends, umkms] = await Promise.all([
            prisma.destination.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    city: true,
                    status: true,
                    validatedScore: true,
                    halalScore: true,
                    reviewCount: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true },
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                },
            }),
            prisma.destinationTrend.groupBy({
                by: ["destinationId"],
                _sum: {
                    viewCount: true,
                    saveCount: true,
                    clickCount: true,
                },
            }),
            prisma.umkm.findMany({
                where: {
                    validationStatus: { not: "APPROVED" },
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    address: true,
                    reviewCount: true,
                    validationStatus: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true },
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
            }),
        ]);

        const trendMap = new Map<string, { views: number; saves: number; clicks: number }>();
        for (const t of trends) {
            trendMap.set(t.destinationId, {
                views: t._sum.viewCount ?? 0,
                saves: t._sum.saveCount ?? 0,
                clicks: t._sum.clickCount ?? 0,
            });
        }

        const items: GapItem[] = [];
        const engagementTotals: number[] = [];

        for (const d of destinations) {
            const trend = trendMap.get(d.id) ?? { views: 0, saves: 0, clicks: 0 };
            const totalEngagement =
                trend.views + trend.saves + trend.clicks + (d.reviewCount ?? 0);
            engagementTotals.push(totalEngagement);
        }

        const threshold75 = getEngagementPercentile(engagementTotals, 75);

        for (const d of destinations) {
            const trend = trendMap.get(d.id) ?? { views: 0, saves: 0, clicks: 0 };
            const reviewTotal = d._count?.reviews ?? d.reviewCount ?? 0;
            const totalEngagement =
                trend.views + trend.saves + trend.clicks + reviewTotal;

            const isLowScore =
                d.validatedScore == null || d.validatedScore < 60;
            if (!isLowScore) continue;

            const isHighEngagement = totalEngagement >= threshold75;

            items.push({
                id: d.id,
                name: d.name,
                slug: d.slug,
                type: "DESTINATION",
                city: d.city,
                imageUrl: d.images[0]?.imageUrl ?? null,
                status: d.status,
                validatedScore: d.validatedScore,
                halalScore: d.halalScore,
                engagement: {
                    views: trend.views,
                    saves: trend.saves,
                    clicks: trend.clicks,
                    reviews: reviewTotal,
                    total: totalEngagement,
                },
                severity: isHighEngagement ? "HIGH" : "MEDIUM",
                actionText: buildDestinationActionText(
                    d.name,
                    d.validatedScore,
                ),
            });
        }

        for (const u of umkms) {
            const reviewTotal = u._count?.reviews ?? u.reviewCount ?? 0;
            if (reviewTotal === 0) continue;

            const totalEngagement = reviewTotal;

            const isHighEngagement = totalEngagement >= threshold75;

            items.push({
                id: u.id,
                name: u.name,
                slug: u.slug,
                type: "UMKM",
                city: null,
                imageUrl: u.images[0]?.imageUrl ?? null,
                status: u.validationStatus,
                validationStatus: u.validationStatus,
                engagement: {
                    views: 0,
                    saves: 0,
                    clicks: 0,
                    reviews: reviewTotal,
                    total: totalEngagement,
                },
                severity: isHighEngagement ? "HIGH" : "MEDIUM",
                actionText: buildUmkmActionText(u.name),
            });
        }

        items.sort((a, b) => {
            if (a.severity === "HIGH" && b.severity !== "HIGH") return -1;
            if (a.severity !== "HIGH" && b.severity === "HIGH") return 1;
            return b.engagement.total - a.engagement.total;
        });

        return NextResponse.json({
            data: items,
            meta: {
                total: items.length,
                highPriority: items.filter((i) => i.severity === "HIGH").length,
                threshold: threshold75,
            },
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
