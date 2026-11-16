import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";
import { toIndicatorScore } from "@/lib/services/acesh/indicator";
import { calculateAndSaveAssessment } from "@/lib/services/acesh/assessment-recalculation-service";

export interface SurveyScoresPayload {
    indicators: Record<string, number>;
    evidence: Record<string, number>;
}

export interface CreateSurveyInput {
    destinationId: string;
    userId?: string | null;
    scores: SurveyScoresPayload;
    comment?: string | null;
}

/** Overall score (0–100) derived from the average of indicator values (0–4). */
export function computeOverallScore(scores: SurveyScoresPayload): number | null {
    const values = Object.values(scores?.indicators ?? {}).filter(
        (v) => typeof v === "number" && !Number.isNaN(v),
    );
    if (values.length === 0) return null;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.round(avg * 25 * 10) / 10;
}

async function recalcDestinationRating(
    tx: Prisma.TransactionClient,
    destinationId: string,
) {
    const aggregate = await tx.destinationSurveyResponse.aggregate({
        where: { destinationId, scoreHiddenAt: null },
        _avg: { overallScore: true },
        _count: { _all: true },
    });
    const average = aggregate._avg.overallScore ?? 0;
    await tx.destination.update({
        where: { id: destinationId },
        data: {
            rating: Math.round((average / 20) * 10) / 10,
            reviewCount: aggregate._count._all,
        },
    });
}

export async function createSurveyResponse(input: CreateSurveyInput) {
    const destination = await prisma.destination.findUnique({
        where: { id: input.destinationId },
        select: { id: true },
    });
    if (!destination) throw new Error("Destinasi tidak ditemukan");

    const overallScore = computeOverallScore(input.scores);

    const survey = await prisma.$transaction(async (tx) => {
        const survey = await tx.destinationSurveyResponse.create({
            data: {
                destinationId: input.destinationId,
                userId: input.userId ?? null,
                scores: input.scores as unknown as Prisma.InputJsonValue,
                overallScore,
                comment: input.comment || null,
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
                destination: { select: { id: true, name: true, slug: true } },
            },
        });

        await recalcDestinationRating(tx, input.destinationId);
        return survey;
    });

    await recalculateCumulativeAcesh(input.destinationId);
    return survey;
}

export async function deleteSurveyResponse(id: string) {
    const result = await prisma.$transaction(async (tx) => {
        const survey = await tx.destinationSurveyResponse.findUnique({
            where: { id },
            select: { destinationId: true },
        });
        if (!survey) throw new Error("Penilaian tidak ditemukan");

        await tx.destinationSurveyResponse.delete({ where: { id } });
        await recalcDestinationRating(tx, survey.destinationId);
        return { id, destinationId: survey.destinationId };
    });

    await recalculateCumulativeAcesh(result.destinationId);
    return { id: result.id };
}

/**
 * Rebuilds every destination indicator from two directions: one official
 * Admin/Dinas value plus all non-hidden visitor values. Every active source
 * has one vote and the 0-4 result is rounded to the nearest supported value.
 * Visitor evidence self-ratings never become official evidence records.
 */
export async function recalculateCumulativeAcesh(destinationId: string) {
    const [indicators, currentScores, surveys] = await Promise.all([
        prisma.aceshIndicator.findMany({
            where: { isActive: true },
            select: { id: true },
        }),
        prisma.aceshIndicatorScore.findMany({
            where: { destinationId },
            select: { indicatorId: true, adminValue: true, notes: true },
        }),
        prisma.destinationSurveyResponse.findMany({
            where: { destinationId, scoreHiddenAt: null },
            select: { scores: true },
        }),
    ]);

    const existingScores = new Map(
        currentScores.map((score) => [score.indicatorId, score]),
    );
    const visitorValues = new Map<string, number[]>();
    for (const survey of surveys) {
        const payload = survey.scores as {
            indicators?: Record<string, unknown>;
        } | null;
        for (const [indicatorId, rawValue] of Object.entries(payload?.indicators ?? {})) {
            if (
                typeof rawValue !== "number" ||
                !Number.isInteger(rawValue) ||
                rawValue < 0 ||
                rawValue > 4
            ) continue;
            const values = visitorValues.get(indicatorId) ?? [];
            values.push(rawValue);
            visitorValues.set(indicatorId, values);
        }
    }

    const assessedAt = new Date();
    const combined: Array<{
        indicatorId: string;
        value: number;
        notes: string | null;
    }> = [];
    // Rows that only exist because of visitor votes and now have no active
    // source left must be removed, otherwise the old value keeps feeding the
    // ACES-H calculation after every score is hidden or deleted.
    const staleIndicatorIds: string[] = [];

    for (const indicator of indicators) {
        const visitorScores = visitorValues.get(indicator.id) ?? [];
        const existing = existingScores.get(indicator.id);
        const adminValue = existing?.adminValue ?? null;
        const sources =
            adminValue != null ? [...visitorScores, adminValue] : visitorScores;

        if (sources.length === 0) {
            if (existing) staleIndicatorIds.push(indicator.id);
            continue;
        }

        const value = Math.round(
            sources.reduce((sum, source) => sum + source, 0) / sources.length,
        );
        combined.push({
            indicatorId: indicator.id,
            value,
            // Keep the admin's own note untouched; only cumulative rows get
            // the automatically generated description.
            notes:
                adminValue != null
                    ? existing?.notes ?? null
                    : `Skor akumulatif dari ${sources.length} sumber aktif`,
        });
    }

    if (combined.length > 0 || staleIndicatorIds.length > 0) {
        await prisma.$transaction([
            ...combined.map((score) =>
                prisma.aceshIndicatorScore.upsert({
                    where: {
                        destinationId_indicatorId: {
                            destinationId,
                            indicatorId: score.indicatorId,
                        },
                    },
                    update: {
                        value: score.value,
                        convertedScore: toIndicatorScore(score.value),
                        notes: score.notes,
                        assessedAt,
                    },
                    create: {
                        destinationId,
                        indicatorId: score.indicatorId,
                        value: score.value,
                        convertedScore: toIndicatorScore(score.value),
                        notes: score.notes,
                        assessedAt,
                    },
                }),
            ),
            ...(staleIndicatorIds.length > 0
                ? [
                      prisma.aceshIndicatorScore.deleteMany({
                          where: {
                              destinationId,
                              indicatorId: { in: staleIndicatorIds },
                              adminValue: null,
                          },
                      }),
                  ]
                : []),
        ]);
    }

    return calculateAndSaveAssessment(
        destinationId,
        undefined,
        `Perhitungan akumulatif Admin/Dinas dan ${surveys.length} penilaian pengunjung aktif`,
    );
}

export type SurveyModerationAction =
    | "HIDE_SCORE"
    | "SHOW_SCORE"
    | "HIDE_COMMENT"
    | "SHOW_COMMENT";

export async function moderateSurveyResponse(
    id: string,
    adminId: string,
    action: SurveyModerationAction,
) {
    const survey = await prisma.destinationSurveyResponse.findUnique({
        where: { id },
        select: { destinationId: true },
    });
    if (!survey) throw new Error("Penilaian tidak ditemukan");

    const now = new Date();
    await prisma.destinationSurveyResponse.update({
        where: { id },
        data:
            action === "HIDE_SCORE"
                ? { scoreHiddenAt: now, scoreHiddenBy: adminId }
                : action === "SHOW_SCORE"
                  ? { scoreHiddenAt: null, scoreHiddenBy: null }
                  : action === "HIDE_COMMENT"
                    ? { commentHiddenAt: now, commentHiddenBy: adminId }
                    : { commentHiddenAt: null, commentHiddenBy: null },
    });

    if (action === "HIDE_SCORE" || action === "SHOW_SCORE") {
        await prisma.$transaction(async (tx) => {
            await recalcDestinationRating(tx, survey.destinationId);
        });
        await recalculateCumulativeAcesh(survey.destinationId);
    }

    return { id, destinationId: survey.destinationId, action };
}

export async function getPaginatedSurveyResponses(
    params: CursorPaginationParams & {
        destinationId?: string;
        search?: string;
    },
) {
    return withCursorPagination(
        async (take, cursor, skip) => {
            const [surveys, indicators] = await Promise.all([
                prisma.destinationSurveyResponse.findMany({
                take,
                skip,
                cursor: cursor ? { id: cursor } : undefined,
                where: {
                    ...(params.destinationId && {
                        destinationId: params.destinationId,
                    }),
                    ...(params.search && {
                        comment: {
                            contains: params.search,
                            mode: "insensitive" as const,
                        },
                    }),
                },
                include: {
                    user: { select: { id: true, name: true, image: true } },
                    destination: {
                        select: { id: true, name: true, slug: true },
                    },
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                }),
                prisma.aceshIndicator.findMany({
                    where: { isActive: true },
                    select: { id: true, code: true, name: true, group: true },
                }),
            ]);
            const indicatorById = new Map(
                indicators.map((indicator) => [indicator.id, indicator]),
            );
            return surveys.map((survey) => {
                const payload = survey.scores as {
                    indicators?: Record<string, unknown>;
                } | null;
                const scoreBreakdown = Object.entries(payload?.indicators ?? {})
                    .flatMap(([indicatorId, rawValue]) => {
                        const indicator = indicatorById.get(indicatorId);
                        if (!indicator || typeof rawValue !== "number") return [];
                        return [{ ...indicator, value: rawValue }];
                    })
                    .sort((a, b) =>
                        a.group.localeCompare(b.group) || a.code.localeCompare(b.code),
                    );
                return { ...survey, scoreBreakdown };
            });
        },
        params,
        "Survey responses fetched successfully",
    );
}

export async function getPublicSurveyComments(destinationId: string) {
    const surveys = await prisma.destinationSurveyResponse.findMany({
        where: {
            destinationId,
            comment: { not: null },
            commentHiddenAt: null,
        },
        select: {
            id: true,
            comment: true,
            overallScore: true,
            scoreHiddenAt: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 20,
    });
    return surveys.map(({ scoreHiddenAt, ...survey }) => ({
        ...survey,
        overallScore: scoreHiddenAt ? null : survey.overallScore,
    }));
}

export async function getSurveySummary(destinationId: string) {
    const aggregate = await prisma.destinationSurveyResponse.aggregate({
        where: { destinationId, scoreHiddenAt: null },
        _avg: { overallScore: true },
        _count: { _all: true },
    });
    return {
        count: aggregate._count._all,
        average: aggregate._avg.overallScore ?? null,
    };
}
