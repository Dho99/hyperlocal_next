import { prisma } from "@/lib/prisma";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";
import type { CreateReviewInput } from "@/lib/validations/review.schema";

export async function getPaginatedReviews(
  params: CursorPaginationParams & { destinationId?: string; umkmId?: string; userId?: string }
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
          ...(params.userId && { userId: params.userId }),
        },
        include: {
          user: true,
          destination: true,
          umkm: true,
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
        rating: input.rating,
        comment: input.comment || null,
      },
      include: {
        user: true,
        destination: true,
        umkm: true,
      },
    });

    if (input.destinationId) {
      const aggregate = await tx.review.aggregate({
        where: { destinationId: input.destinationId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.destination.update({
        where: { id: input.destinationId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count._all,
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

    return review;
  });
}
