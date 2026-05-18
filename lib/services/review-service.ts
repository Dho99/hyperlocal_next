import { prisma } from "@/lib/prisma";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

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
