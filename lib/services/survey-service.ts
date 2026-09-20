import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

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
        where: { destinationId },
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

    return prisma.$transaction(async (tx) => {
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
}

export async function deleteSurveyResponse(id: string) {
    return prisma.$transaction(async (tx) => {
        const survey = await tx.destinationSurveyResponse.findUnique({
            where: { id },
            select: { destinationId: true },
        });
        if (!survey) throw new Error("Penilaian tidak ditemukan");

        await tx.destinationSurveyResponse.delete({ where: { id } });
        await recalcDestinationRating(tx, survey.destinationId);
        return { id };
    });
}

export async function getPaginatedSurveyResponses(
    params: CursorPaginationParams & {
        destinationId?: string;
        search?: string;
    },
) {
    return withCursorPagination(
        async (take, cursor, skip) =>
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
        params,
        "Survey responses fetched successfully",
    );
}

export async function getSurveySummary(destinationId: string) {
    const aggregate = await prisma.destinationSurveyResponse.aggregate({
        where: { destinationId },
        _avg: { overallScore: true },
        _count: { _all: true },
    });
    return {
        count: aggregate._count._all,
        average: aggregate._avg.overallScore ?? null,
    };
}
