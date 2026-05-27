import { subDays, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { CertificationStatus } from "../generated/prisma";
import type { DashboardMapDestination } from "@/types/map-viewer";

export async function getAllMapDestinations(): Promise<DashboardMapDestination[]> {
    const destinations = await prisma.destination.findMany({
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
            category: true,
        },
    });

    return destinations.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category?.name || "Destinasi",
        status: d.status,
        latitude: d.latitude != null ? Number(d.latitude) : 0,
        longitude: d.longitude != null ? Number(d.longitude) : 0,
    }));
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function percent(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

function normalizeScore(value: number | null | undefined) {
    if (!value) return 0;
    return Math.min(100, Math.round((value / 3) * 100));
}

function activityLabel(type: string) {
    const labels: Record<string, string> = {
        VIEW: "Dilihat wisatawan",
        SEARCH: "Muncul dari pencarian",
        CLICK: "Dibuka dari listing",
        SAVE: "Disimpan ke rencana",
        SHARE: "Dibagikan",
        ROUTE: "Rute diminta",
    };

    return labels[type] || "Aktivitas baru";
}

export async function getDashboardOverview() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekStart = startOfWeek(now);
    const sevenDaysAgo = startOfDay(subDays(now, 6));

    const pTotalDestinations = prisma.destination.count();

    const pApprovedDestinations = prisma.halalCertification.count({
        where: {
            status: "VALID" as CertificationStatus,
        },
    });

    const pPendingDestinations = prisma.destination.count({
        where: { status: "PENDING" },
    });
    const pTotalUmkms = prisma.umkm.count();
    const pNewDestinationsThisMonth = prisma.destination.count({
        where: { createdAt: { gte: monthStart } },
    });
    const pNewUmkmsThisWeek = prisma.umkm.count({
        where: { createdAt: { gte: weekStart } },
    });
    const pPendingValidations = prisma.halalCertification.count({
        where: { status: "PENDING" as CertificationStatus },
    });
    const pValidCertifications = prisma.halalCertification.count({
        where: { status: "VALID" as CertificationStatus },
    });
    const pTotalFacilities = prisma.halalFacility.count();

    const pReadinessScores = prisma.halalReadinessScore.findMany({
        where: { regionType: "city" },
        orderBy: { totalScore: "desc" },
        take: 5,
    });

    const pLatestDestinations = prisma.destination.findMany({
        take: 5,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        include: {
            category: true,
        },
    });

    const pTopDestinations = prisma.destination.findMany({
        take: 5,
        orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
        include: {
            category: true,
            images: {
                take: 1,
                orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            },
            _count: {
                select: {
                    interactions: true,
                    reviews: true,
                },
            },
        },
    });

    const pRecentInteractions = prisma.destinationInteraction.findMany({
        take: 6,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
            destination: {
                select: {
                    name: true,
                    city: true,
                },
            },
        },
    });

    const pInteractionWindow = prisma.destinationInteraction.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
            type: true,
            createdAt: true,
        },
    });

    const pRecentValidations = prisma.halalCertification.findMany({
        include: {
            umkm: {
                include: {
                    category: true,
                },
            },
        },
    });

    const [
        totalDestinations,
        approvedDestinations,
        pendingDestinations,
        totalUmkms,
        newDestinationsThisMonth,
        newUmkmsThisWeek,
        pendingValidations,
        validCertifications,
        totalFacilities,
        readinessScores,
        latestDestinations,
        topDestinations,
        recentInteractions,
        interactionWindow,
        recentValidations,
    ] = await Promise.all([
        pTotalDestinations,
        pApprovedDestinations,
        pPendingDestinations,
        pTotalUmkms,
        pNewDestinationsThisMonth,
        pNewUmkmsThisWeek,
        pPendingValidations,
        pValidCertifications,
        pTotalFacilities,
        pReadinessScores,
        pLatestDestinations,
        pTopDestinations,
        pRecentInteractions,
        pInteractionWindow,
        pRecentValidations,
    ]);

    const chartDays = Array.from({ length: 7 }, (_, index) => {
        const date = startOfDay(subDays(now, 6 - index));
        return {
            key: date.toISOString().slice(0, 10),
            label: DAY_LABELS[date.getDay()],
            views: 0,
            searches: 0,
            saves: 0,
        };
    });

    for (const interaction of interactionWindow) {
        const key = startOfDay(interaction.createdAt)
            .toISOString()
            .slice(0, 10);
        const day = chartDays.find((item) => item.key === key);
        if (!day) continue;

        if (interaction.type === "VIEW") day.views += 1;
        if (interaction.type === "SEARCH") day.searches += 1;
        if (interaction.type === "SAVE") day.saves += 1;
    }

    const maxChartValue = Math.max(
        1,
        ...chartDays.map((day) => day.views + day.searches + day.saves),
    );

    const readinessAverage = readinessScores.reduce(
        (acc, score) => ({
            facility: acc.facility + score.halalFacilityScore,
            food: acc.food + score.halalFoodScore,
            worship: acc.worship + score.worshipAccessScore,
            total: acc.total + score.totalScore,
        }),
        { facility: 0, food: 0, worship: 0, total: 0 },
    );

    const readinessCount = readinessScores.length || 1;
    const readiness = [
        {
            label: "Fasilitas Halal",
            value: readinessScores.length
                ? normalizeScore(readinessAverage.facility / readinessCount)
                : percent(totalFacilities, Math.max(totalDestinations, 1) * 2),
        },
        {
            label: "Kuliner Tersertifikasi",
            value: readinessScores.length
                ? normalizeScore(readinessAverage.food / readinessCount)
                : percent(validCertifications, Math.max(totalUmkms, 1)),
        },
        {
            label: "Akses Ibadah",
            value: readinessScores.length
                ? normalizeScore(readinessAverage.worship / readinessCount)
                : percent(approvedDestinations, Math.max(totalDestinations, 1)),
        },
    ];

    const overallReadiness = readinessScores.length
        ? normalizeScore(readinessAverage.total / readinessCount)
        : Math.round(
              readiness.reduce((sum, item) => sum + item.value, 0) /
                  readiness.length,
          );

    return {
        stats: {
            totalDestinations,
            approvedDestinations,
            pendingDestinations,
            totalUmkms,
            newDestinationsThisMonth,
            newUmkmsThisWeek,
            pendingValidations,
            verifiedPercent: percent(approvedDestinations, totalDestinations),
            validCertifications,
        },
        readiness,
        overallReadiness,
        chart: {
            days: chartDays.map((day) => ({
                ...day,
                total: day.views + day.searches + day.saves,
                height: Math.max(
                    8,
                    Math.round(
                        ((day.views + day.searches + day.saves) /
                            maxChartValue) *
                            100,
                    ),
                ),
            })),
        },
        recentValidations: recentValidations.map((validation) => ({
            id: validation.id,
            name: validation.umkm.name,
            category: validation.umkm.category?.name || "UMKM",
            date: validation.createdAt,
            status: validation.status,
            validator: validation.issuer || "Belum ditugaskan",
        })),
        latestDestinations: latestDestinations.map((destination) => ({
            id: destination.id,
            name: destination.name,
            category: destination.category?.name || "Destinasi",
            date: destination.updatedAt,
            status: destination.status,
            city: destination.city || destination.province || "Tanpa wilayah",
        })),
        topDestinations: topDestinations.map((destination) => ({
            id: destination.id,
            name: destination.name,
            category: destination.category?.name || "Destinasi",
            city: destination.city || destination.province || "Tanpa wilayah",
            rating: destination.rating || 0,
            reviewCount: destination.reviewCount || 0,
            engagement: destination._count.interactions,
            imageUrl: destination.images[0]?.imageUrl || null,
        })),
        recentActivities: recentInteractions.map((interaction) => ({
            id: interaction.id,
            title: activityLabel(interaction.type),
            destination: interaction.destination.name,
            city: interaction.destination.city || "Hyperlocal",
            createdAt: interaction.createdAt,
            type: interaction.type,
        })),
    };
}
