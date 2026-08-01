import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshIndicatorScoreBatchSchema } from "@/lib/validations/acesh.schema";
import { toIndicatorScore } from "@/lib/services/acesh/indicator";
import { calculateGroupScore } from "@/lib/services/acesh/indicator";
import {
    ACES_DIMENSION_WEIGHTS,
    HYPERLOCAL_DIMENSION_WEIGHTS,
    GROUP_LABELS,
} from "@/lib/services/acesh/constants";
import {
    calculateAssessmentSnapshot,
    calculateAndSaveAssessment,
} from "@/lib/services/acesh/assessment-recalculation-service";
import { getErrorMessage } from "@/lib/api-error";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return null;
    return session;
}

function serializeAssessment(snapshot: Awaited<ReturnType<typeof calculateAssessmentSnapshot>>) {
    return {
        acesScore: snapshot.acesScore,
        hyperlocalScore: snapshot.hyperlocalScore,
        baseScore: snapshot.baseScore,
        evidenceConfidenceScore: snapshot.evidenceConfidenceScore,
        evidenceFactor: snapshot.evidenceFactor,
        verifiedScore: snapshot.verifiedScore,
        classification: snapshot.classification,
        verificationStatus: snapshot.verificationStatus,
        calculatedAt: snapshot.calculatedAt.toISOString(),
        calculationVersion: snapshot.calculationVersion,
    };
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const destination = await prisma.destination.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!destination) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

        const [snapshot, indicators, indicatorScores, evidenceRecords, history] =
            await Promise.all([
                calculateAssessmentSnapshot(id),
                prisma.aceshIndicator.findMany({
                    where: { isActive: true },
                    orderBy: [{ group: "asc" }, { code: "asc" }],
                }),
                prisma.aceshIndicatorScore.findMany({ where: { destinationId: id } }),
                prisma.aceshEvidenceRecord.findMany({
                    where: { destinationId: id },
                    include: { validator: { select: { name: true, email: true } } },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.aceshAssessmentHistory.findMany({
                    where: { destinationId: id },
                    orderBy: { calculatedAt: "desc" },
                    take: 20,
                }),
            ]);

        const scoreByIndicator = new Map(
            indicatorScores.map((s) => [s.indicatorId, s]),
        );

        // Group breakdown computed server-side so the client never runs formulas.
        const allGroups = [
            ...Object.keys(ACES_DIMENSION_WEIGHTS),
            ...Object.keys(HYPERLOCAL_DIMENSION_WEIGHTS),
        ] as const;
        const groupBreakdown = allGroups.map((group) => {
            const groupIndicators = indicators.filter((i) => i.group === group);
            const inputs = groupIndicators
                .map((i) => {
                    const score = scoreByIndicator.get(i.id);
                    return score ? { value: score.value, weight: i.weight } : null;
                })
                .filter((x): x is { value: number; weight: number } => x !== null);
            const groupScore = calculateGroupScore(inputs);
            const dimensionWeight =
                ACES_DIMENSION_WEIGHTS[group as keyof typeof ACES_DIMENSION_WEIGHTS] ??
                HYPERLOCAL_DIMENSION_WEIGHTS[group as keyof typeof HYPERLOCAL_DIMENSION_WEIGHTS] ??
                null;
            return {
                group,
                label: GROUP_LABELS[group as keyof typeof GROUP_LABELS],
                groupScore,
                dimensionWeight,
                contribution:
                    dimensionWeight != null ? Math.round(groupScore * dimensionWeight * 10) / 10 : null,
            };
        });

        return NextResponse.json(
            {
                data: {
                    assessment: serializeAssessment(snapshot),
                    groupBreakdown,
                    indicators: indicators.map((i) => ({
                        ...i,
                        score: scoreByIndicator.get(i.id) ?? null,
                    })),
                    evidenceRecords,
                    history,
                },
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = aceshIndicatorScoreBatchSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data skor indikator tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const destination = await prisma.destination.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!destination) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

        await prisma.$transaction(
            validated.data.scores.map((entry) =>
                prisma.aceshIndicatorScore.upsert({
                    where: {
                        destinationId_indicatorId: {
                            destinationId: id,
                            indicatorId: entry.indicatorId,
                        },
                    },
                    update: {
                        value: entry.value,
                        convertedScore: toIndicatorScore(entry.value),
                        notes: entry.notes ?? null,
                        assessedBy: session.user.id,
                        assessedAt: new Date(),
                    },
                    create: {
                        destinationId: id,
                        indicatorId: entry.indicatorId,
                        value: entry.value,
                        convertedScore: toIndicatorScore(entry.value),
                        notes: entry.notes ?? null,
                        assessedBy: session.user.id,
                        assessedAt: new Date(),
                    },
                }),
            ),
        );

        const snapshot = await calculateAndSaveAssessment(
            id,
            session.user.id,
            "Pembaruan skor indikator",
        );

        return NextResponse.json(
            { data: { assessment: serializeAssessment(snapshot) } },
            { status: 200 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
