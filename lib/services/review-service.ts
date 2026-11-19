import { prisma } from "@/lib/prisma";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";
import type { CreateReviewInput } from "@/lib/validations/review.schema";

export async function getPaginatedReviews(
  params: CursorPaginationParams & { destinationId?: string; umkmId?: string; accommodationId?: string; userId?: string }
) {
  return withCursorPagination(
    async (take, cursor, skip) => {
      return await prisma.review.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(params.destinationId && { destinationId: params.destinationId }),
          ...(params.umkmId && { umkmId: params.umkmId }),
          ...(params.accommodationId && { accommodationId: params.accommodationId }),
          ...(params.userId && { userId: params.userId }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          destination: true,
          umkm: true,
          accommodation: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    },
    params,
    "Reviews fetched successfully"
  );
}

export async function createReview(userId: string, input: CreateReviewInput) {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        userId,
        destinationId: input.destinationId,
        umkmId: input.umkmId,
        accommodationId: input.accommodationId,
        rating: input.rating,
        comment: input.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        destination: true,
        umkm: true,
        accommodation: true,
      },
    });

    if (input.destinationId) {
      const aggregate = await tx.review.aggregate({
        where: { destinationId: input.destinationId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      const surveys = tx.destinationSurveyResponse
        ? await tx.destinationSurveyResponse.aggregate({
            where: { destinationId: input.destinationId, scoreHiddenAt: null, overallScore: { not: null } },
            _avg: { overallScore: true },
            _count: { _all: true },
          })
        : { _avg: { overallScore: null }, _count: { _all: 0 } };
      const reviewCount = aggregate._count._all;
      const surveyCount = surveys._count._all;
      const totalCount = reviewCount + surveyCount;

      await tx.destination.update({
        where: { id: input.destinationId },
        data: {
          rating: totalCount === 0 ? 0 : ((aggregate._avg.rating ?? 0) * reviewCount + ((surveys._avg.overallScore ?? 0) / 20) * surveyCount) / totalCount,
          reviewCount: totalCount,
        },
      });
    }

    if (input.umkmId) {
      const aggregate = await tx.review.aggregate({
        where: { umkmId: input.umkmId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.umkm.update({
        where: { id: input.umkmId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count._all,
        },
      });
    }

    if (input.accommodationId) {
      const aggregate = await tx.review.aggregate({
        where: { accommodationId: input.accommodationId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.accommodation.update({
        where: { id: input.accommodationId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count._all,
        },
      });
    }

    return review;
  });
}
